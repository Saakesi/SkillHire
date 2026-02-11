import { filterValidRepos } from "../antiGaming/repoFilter.js";
import { calculateConfidence } from "./confidenceCalculator.js";
import { calculateTrust } from "./trustCalculator.js";
import { calculateWeightedScore } from "./weightedScoreCalculator.js";
import { aggregateFinalScores } from "./finalScoreAggregator.js";
import { extractSkills } from "./skillExtractor.js";

export function analyzeRepos(repos) {
  // 🛑 Hard guard
  if (!Array.isArray(repos) || repos.length === 0) {
    console.error("❌ analyzeRepos: invalid repos input");
    return [];
  }

  // 🧹 Anti-gaming filter
  const validRepos = filterValidRepos(repos);
  if (!validRepos.length) {
    console.warn("⚠️ No valid repos after filtering");
    return [];
  }

  // 🧠 Skill extraction (languages, topics, files, readme)
  const skills = extractSkills(validRepos);
  if (!skills.length) {
    console.warn("⚠️ extractSkills returned empty");
    return [];
  }

  // 📊 Enrich each skill
  const enrichedSkills = skills.map(skill => {
    // ✅ Confidence should depend on repo frequency (NOT commits yet)
    const confidence = calculateConfidence(skill, validRepos);

    // ✅ Trust uses repo quality signals
    const trustScore = calculateTrust(skill, validRepos);

    // ✅ Weighted score depends on stars + confidence
    const weightedScore = calculateWeightedScore(
      { ...skill, confidence },
      validRepos
    );

    // ✅ Final aggregation (safe against NaN)
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

  // 🏆 Highest impact skills first
  return enrichedSkills.sort(
    (a, b) => (b.finalScore || 0) - (a.finalScore || 0)
  );
}
