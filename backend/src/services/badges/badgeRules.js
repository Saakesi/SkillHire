export const badgeRules = [
  {
    id: "consistent_contributor",
    condition: (rawMetrics) =>
      rawMetrics.commitCount6Months >= 50 &&
      rawMetrics.activeWeeks >= 10
  },

  {
    id: "popular_maintainer",
    condition: (rawMetrics) =>
      rawMetrics.totalStars >= 50 ||
      rawMetrics.totalForks >= 20
  },

  {
    id: "open_source_collaborator",
    condition: (rawMetrics) =>
      rawMetrics.externalPRs >= 5 ||
      rawMetrics.mergedPRCount >= 10
  },

  {
    id: "test_driven_developer",
    condition: (rawMetrics) =>
      rawMetrics.qualityIndicators.tests > 0
  },

  {
    id: "devops_ready",
    condition: (rawMetrics) =>
      rawMetrics.qualityIndicators.docker > 0 ||
      rawMetrics.qualityIndicators.ci > 0
  },

  {
    id: "polyglot",
    condition: (rawMetrics) =>
      rawMetrics.languageEntropy >= 1.2
  }
];