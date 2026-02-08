export const aggregateFinalScores = ({
  confidence,
  trustScore,
  weightedScore
}) => {
  return Math.round(confidence * trustScore * weightedScore);
};
