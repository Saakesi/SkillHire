import { normalizeMetrics } from "./ normalizeService.js";
import { computeWeightedScore } from "./weightService.js";
import {
  detectGaming,
  computeTrustScore,
  computeConfidenceScore
} from "./trustService.js";

export function computeGitHireScore(rawMetrics) {

  const normalized = normalizeMetrics(rawMetrics);

  let weightedScore = computeWeightedScore(normalized);

  const penalty = detectGaming(rawMetrics);

  const trustScore = computeTrustScore(rawMetrics);

  const confidenceScore = computeConfidenceScore(rawMetrics);

  weightedScore -= penalty;

  const finalScore = weightedScore * (trustScore / 100);

  return {
    normalizedScores: normalized,
    weightedScore,
    penalty,
    trustScore,
    confidenceScore,
    finalScore: Math.max(finalScore, 0)
  };
}