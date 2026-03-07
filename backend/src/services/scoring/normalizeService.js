function scale(value, max) {
  return Math.min((value / max) * 100, 100);
}

export function normalizeMetrics(raw) {
  const q = raw.qualityIndicators || {};
  console.log("QUALITY INDICATORS RECEIVED:", raw.qualityIndicators);

  const qualityScore =
    (q.readme || 0) * 5 +
    (q.ci || 0) * 20 +
    (q.tests || 0) * 20 +
    (q.docker || 0) * 20 +
    (q.license || 0) * 15;

    console.log("QUALITY SCORE:", qualityScore);

  return {
    repoScore: scale(raw.repoCount, 30),

    starScore: scale(raw.totalStars, 200),

    forkScore: scale(raw.totalForks, 100),

    activityScore: scale(raw.commitCount6Months, 200),

    consistencyScore: scale(raw.activeWeeks, 26),

    streakScore: scale(raw.longestStreak, 30),

    collaborationScore: scale(
      raw.prCount + raw.mergedPRCount + raw.externalPRs,
      50
    ),

    issueScore: scale(raw.issueCount, 30),

    languageDiversityScore: scale(raw.languageEntropy, 3),

    frameworkScore: scale(raw.frameworks?.length || 0, 5),

    projectQualityScore: Math.min(qualityScore, 100)
  };
}