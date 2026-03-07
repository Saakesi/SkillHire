export const WEIGHTS = {
  repoScore: 0.10,
  starScore: 0.10,
  forkScore: 0.05,
  activityScore: 0.20,
  consistencyScore: 0.10,
  streakScore: 0.05,
  collaborationScore: 0.15,
  issueScore: 0.05,
  languageDiversityScore: 0.10,
  frameworkScore: 0.05,
  projectQualityScore: 0.05
};

export function computeWeightedScore(scores) {
  let total = 0;

  for (const key in WEIGHTS) {
    total += scores[key] * WEIGHTS[key];
  }

  return total;
}