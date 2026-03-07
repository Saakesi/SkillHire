export function detectGaming(raw) {
  let penalty = 0;

  // Many repos but no stars
  if (raw.repoCount > 10 && raw.totalStars === 0) {
    penalty += 10;
  }

  // Many commits but low activity weeks
  if (raw.commitCount6Months > 200 && raw.activeWeeks < 5) {
    penalty += 10;
  }

  // PR spam
  if (raw.prCount > 50 && raw.mergedPRCount < 5) {
    penalty += 10;
  }

  return penalty;
}

export function computeTrustScore(raw) {
  let score = 100;

  if (raw.totalStars === 0) score -= 10;

  if (raw.externalPRs === 0) score -= 10;

  if (raw.activeWeeks < 3) score -= 10;

  return Math.max(score, 0);
}

export function computeConfidenceScore(raw) {
  let score = 0;

  if (raw.repoCount >= 3) score += 25;

  if (raw.commitCount6Months >= 20) score += 25;

  if (raw.activeWeeks >= 5) score += 25;

  if (raw.frameworks.length > 0) score += 25;

  return score;
}