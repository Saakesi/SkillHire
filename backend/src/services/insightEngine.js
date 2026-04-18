import Analysis from "../models/Analysis.js";
import { cacheGet, cacheSet } from "./cache/cacheService.js";
import { formatInsightsWithAI } from "./insightFormatterAI.js";

const STATS_CACHE_KEY = "insights:dataset-stats:v1";
const STATS_TTL_SECONDS = 60 * 10;

const DIMENSIONS = [
  { key: "activityScore", label: "Activity Score", category: "Activity", family: "activity", getter: (a) => a?.scoreBreakdown?.normalizedScores?.activityScore },
  { key: "consistencyScore", label: "Consistency Score", category: "Activity", family: "consistency", getter: (a) => a?.scoreBreakdown?.normalizedScores?.consistencyScore },
  { key: "collaborationScore", label: "Collaboration Score", category: "Collaboration", family: "collaboration", getter: (a) => a?.scoreBreakdown?.normalizedScores?.collaborationScore },
  { key: "codeReviewScore", label: "Code Review Score", category: "Collaboration", family: "codeReview", getter: (a) => a?.scoreBreakdown?.normalizedScores?.codeReviewScore },
  { key: "projectQualityScore", label: "Project Quality Score", category: "Quality", family: "quality", getter: (a) => a?.scoreBreakdown?.normalizedScores?.projectQualityScore },
  { key: "languageDiversityScore", label: "Language Diversity Score", category: "Languages", family: "languageDiversity", getter: (a) => a?.scoreBreakdown?.normalizedScores?.languageDiversityScore },
  { key: "frameworkScore", label: "Framework Score", category: "Stack", family: "frameworks", getter: (a) => a?.scoreBreakdown?.normalizedScores?.frameworkScore },
  { key: "repoScore", label: "Repository Score", category: "Output", family: "repos", getter: (a) => a?.scoreBreakdown?.normalizedScores?.repoScore },
  { key: "starScore", label: "Stars Score", category: "Output", family: "stars", getter: (a) => a?.scoreBreakdown?.normalizedScores?.starScore },
  { key: "forkScore", label: "Forks Score", category: "Output", family: "forks", getter: (a) => a?.scoreBreakdown?.normalizedScores?.forkScore },
  { key: "leetcodeScore", label: "LeetCode Score", category: "Algorithms", family: "leetcodeScore", getter: (a) => a?.leetcodeScore },
  { key: "commitCount6Months", label: "Commits (6 Months)", category: "Activity", family: "commits", getter: (a) => a?.rawMetrics?.commitCount6Months },
  { key: "activeWeeks", label: "Active Weeks", category: "Activity", family: "activeWeeks", getter: (a) => a?.rawMetrics?.activeWeeks },
  { key: "repoCount", label: "Repository Count", category: "Output", family: "repoCount", getter: (a) => a?.rawMetrics?.repoCount },
  { key: "prCount", label: "Pull Request Count", category: "Collaboration", family: "prs", getter: (a) => a?.rawMetrics?.prCount },
  { key: "reviewsGiven", label: "Reviews Given", category: "Collaboration", family: "reviewsGiven", getter: (a) => a?.rawMetrics?.reviewsGiven },
  { key: "leetcodeSolvedTotal", label: "LeetCode Problems Solved", category: "Algorithms", family: "leetcodeSolved", getter: (a) => a?.leetcodeMetrics?.solved?.total },
  { key: "leetcodeContestRating", label: "LeetCode Contest Rating", category: "Algorithms", family: "leetcodeContest", getter: (a) => a?.leetcodeMetrics?.contest?.rating }
];

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const mean = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

const median = (arr) => {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) return (sorted[mid - 1] + sorted[mid]) / 2;
  return sorted[mid];
};

const stdDev = (arr, avg) => {
  if (arr.length < 2) return 0;
  const variance = arr.reduce((acc, value) => acc + ((value - avg) ** 2), 0) / arr.length;
  return Math.sqrt(variance);
};

const percentileRank = (sortedValues, value) => {
  if (!sortedValues.length) return 0;
  let count = 0;
  for (const v of sortedValues) {
    if (v <= value) count += 1;
    else break;
  }
  return (count / sortedValues.length) * 100;
};

const buildDatasetStats = async () => {
  const cached = await cacheGet(STATS_CACHE_KEY);
  if (cached && cached.dimensions) return cached;

  const analyses = await Analysis.find({ status: "completed" })
    .select("rawMetrics scoreBreakdown.normalizedScores leetcodeMetrics leetcodeScore")
    .lean();

  const stats = {};

  for (const dim of DIMENSIONS) {
    const values = analyses
      .map((analysis) => toNumber(dim.getter(analysis)))
      .filter((v) => v !== null);

    const sorted = [...values].sort((a, b) => a - b);
    const avg = mean(values);
    const med = median(values);
    const sd = stdDev(values, avg);

    stats[dim.key] = {
      category: dim.category,
      mean: avg,
      median: med,
      stdDev: sd,
      count: values.length,
      sorted
    };
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    totalProfiles: analyses.length,
    dimensions: stats
  };

  await cacheSet(STATS_CACHE_KEY, payload, STATS_TTL_SECONDS);
  return payload;
};

const buildContextLabel = (value, med, percentile) => {
  if (Math.abs(value - med) < 1e-6) return "around median";
  if (percentile >= 75) return "well above median";
  if (percentile >= 50) return "above median";
  if (percentile <= 25) return "well below median";
  return "below median";
};

const round = (value, digits = 2) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const getPriorityBand = (percentile) => {
  if (percentile < 40) return "critical";
  if (percentile < 70) return "moderate";
  return "strong";
};

export const generateDeveloperInsights = async (analysis) => {
  if (!analysis) return { insightObjects: [], insights: [], statsGeneratedAt: null };

  const datasetStats = await buildDatasetStats();
  const insightObjects = [];

  for (const dim of DIMENSIONS) {
    const value = toNumber(dim.getter(analysis));
    if (value === null) continue;

    const stat = datasetStats.dimensions[dim.key];
    if (!stat || !stat.count) continue;

    const percentile = percentileRank(stat.sorted, value);
    const zScore = stat.stdDev > 0 ? (value - stat.mean) / stat.stdDev : 0;

    insightObjects.push({
      category: dim.category,
      metric: dim.key,
      metricLabel: dim.label,
      family: dim.family,
      userValue: round(value),
      percentile: round(percentile, 1),
      zScore: round(zScore, 2),
      mean: round(stat.mean),
      median: round(stat.median),
      context: buildContextLabel(value, stat.median, percentile),
      priority: getPriorityBand(percentile)
    });
  }

  // Keep diagnosis diverse while biasing toward weaker areas for better improvement advice.
  const selected = [];
  const usedFamilies = new Set();
  const categoryCounts = new Map();

  const weakFirst = [...insightObjects].sort((a, b) => {
    if (a.percentile !== b.percentile) return a.percentile - b.percentile;
    return Math.abs(b.zScore) - Math.abs(a.zScore);
  });

  const strongNext = [...insightObjects].sort((a, b) => {
    if (a.percentile !== b.percentile) return b.percentile - a.percentile;
    return Math.abs(b.zScore) - Math.abs(a.zScore);
  });

  const pushIfEligible = (item) => {
    if (usedFamilies.has(item.family)) return false;
    const categoryCount = categoryCounts.get(item.category) || 0;
    if (categoryCount >= 2) return false;

    selected.push(item);
    usedFamilies.add(item.family);
    categoryCounts.set(item.category, categoryCount + 1);
    return true;
  };

  // Ensure diagnosis starts with practical improvement targets.
  for (const item of weakFirst) {
    pushIfEligible(item);
    if (selected.length >= 5) break;
  }

  // Then add strengths for balance/context.
  for (const item of strongNext) {
    if (selected.some((s) => s.metric === item.metric)) continue;
    pushIfEligible(item);
    if (selected.length >= 8) break;
  }

  // Final backfill for sparse datasets.
  if (selected.length < 5) {
    const byImpact = [...insightObjects].sort((a, b) => Math.abs(b.zScore) - Math.abs(a.zScore));
    for (const item of byImpact) {
      if (selected.some((s) => s.metric === item.metric)) continue;
      selected.push(item);
      if (selected.length >= 8) break;
    }
  }

  const insights = await formatInsightsWithAI(selected);

  return {
    insightObjects: selected,
    insights,
    statsGeneratedAt: datasetStats.generatedAt
  };
};
