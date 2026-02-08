import { filterValidRepos } from "../antiGaming/repoFilter.js";
import {calculateConfidence} from "./confidenceCalculator.js"
import   {calculateTrust} from "./trustCalculator.js"
import   {calculateWeightedScore} from "./weightedScoreCalculator.js"
import   {aggregateFinalScores} from "./finalScoreAggregator.js"
import { extractSkills } from "./skillExtractor.js";

export function analyzeRepos(repos) {
  if (!Array.isArray(repos) || repos.length === 0) {
    console.error("❌ analyzeRepos: invalid repos input");
    return [];
  }

  const validRepos = filterValidRepos(repos) || [];

  if (validRepos.length === 0) {
    console.warn("⚠️ No valid repos after filtering");
    return [];
  }

  let skills = extractSkills(validRepos);

  if (!Array.isArray(skills) || skills.length === 0) {
    console.warn("⚠️ extractSkills returned empty");
    return [];
  }

  const enriched = skills.map(skill => {
    const confidence = calculateConfidence(skill);
    const trustScore = calculateTrust(skill, validRepos);
    const weightedScore = calculateWeightedScore(
      { ...skill, confidence },
      validRepos
    );
    const finalScore = aggregateFinalScores({
      confidence,
      trustScore,
      weightedScore
    });

    return {
      ...skill,
      confidence,
      trustScore,
      weightedScore,
      finalScore
    };
  });

  return enriched.sort((a, b) => b.finalScore - a.finalScore);
}
