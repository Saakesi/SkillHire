import { normalizeMetrics } from "./normalizeService.js";
import { computeWeightedScore } from "./weightService.js";
import {
  detectGaming,
  computeTrustScore,
  computeConfidenceScore
} from "./trustService.js";

export function computeGitHireScore(rawMetrics, leetcodeScore = 0) {

  const normalized = normalizeMetrics(rawMetrics);
  console.log("NORMALIZED SCORES:", normalized);
  console.log("PROJECT QUALITY SCORE:", normalized.projectQualityScore);

  let weightedScore = computeWeightedScore(normalized);

  const penalty = detectGaming(rawMetrics);

  const trustScore = computeTrustScore(rawMetrics);

  const confidenceScore = computeConfidenceScore(rawMetrics);

  weightedScore -= penalty;

  const githubFinalScore = weightedScore * (trustScore / 100);

  // If LeetCode data exists, blend it in as a 15% optional bonus.
  // GitHub metrics are scaled to 85%, LC contributes up to 15%.
  // Developers without LC are NOT penalized — the score simply
  // reflects GitHub-only performance at full weight.
  let finalScore;
  let leetcodeContribution = 0;

  if (leetcodeScore > 0) {
    leetcodeContribution = Math.round(leetcodeScore * 0.15 * 100) / 100;
    finalScore = (githubFinalScore * 0.85) + leetcodeContribution;
  } else {
    finalScore = githubFinalScore;
  }

  return {
    normalizedScores: normalized,
    weightedScore,
    penalty,
    trustScore,
    confidenceScore,
    leetcodeContribution,
    finalScore: Math.max(finalScore, 0)
  };
}