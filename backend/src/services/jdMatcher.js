import Analysis from "../models/Analysis.js";
import { parseJDWithGemini } from "./jdParserGemini.js";

const normalizeTerm = (value) => {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return "";

  const compact = raw.replace(/\s+/g, " ");
  if (compact === "cpp" || compact === "c plus plus" || compact === "c-plus-plus") return "c++";
  if (compact === "js") return "javascript";
  if (compact === "ts") return "typescript";
  if (compact === "py") return "python";
  if (
    compact === "mysql" ||
    compact === "postgres" ||
    compact === "postgresql" ||
    compact === "mssql" ||
    compact === "sql server" ||
    compact === "sqlite"
  ) {
    return "sql";
  }
  if (
    compact === "oop" ||
    compact === "oops" ||
    compact === "object oriented programming" ||
    compact === "object-oriented programming" ||
    compact === "object oriented design" ||
    compact === "object-oriented design"
  ) {
    return "design";
  }

  return compact;
};

const TERM_EXPANSIONS = {
  "data structures": [
    "array",
    "string",
    "linked list",
    "stack",
    "queue",
    "tree",
    "binary tree",
    "hash table",
    "graph theory"
  ],
  "algorithm development": [
    "dynamic programming",
    "greedy",
    "binary search",
    "recursion",
    "divide and conquer",
    "graph theory",
    "bit manipulation"
  ],
  "complexity analysis": [
    "dynamic programming",
    "greedy",
    "binary search",
    "math"
  ],
  "problem-solving": [
    "dynamic programming",
    "greedy",
    "binary search",
    "graph theory",
    "backtracking",
    "math"
  ],
  "object-oriented design": ["design"],
  "relational database concepts": ["sql", "database"]
};

const expandedCandidatesForTerm = (term) => {
  const normalized = normalizeTerm(term);
  if (!normalized) return [];

  const expanded = TERM_EXPANSIONS[normalized] || [];
  return [normalized, ...expanded.map(normalizeTerm)].filter(Boolean);
};

const hasTermMatch = (term, matcherSet) => {
  const candidates = expandedCandidatesForTerm(term);
  return candidates.some((candidate) => matcherSet.has(candidate));
};

const toSet = (values) => {
  if (!values) return new Set();

  const list = Array.isArray(values)
    ? values
    : values instanceof Set
      ? Array.from(values)
      : typeof values[Symbol.iterator] === "function"
        ? Array.from(values)
        : [];

  return new Set(list.map(normalizeTerm).filter(Boolean));
};

const setIntersection = (leftSet, rightSet) => {
  const out = new Set();
  for (const value of leftSet) {
    if (rightSet.has(value)) out.add(value);
  }
  return out;
};

const setToSortedArray = (set) => Array.from(set).sort((a, b) => a.localeCompare(b));

const getMeasurableTerms = (terms, observableSet) => {
  const result = new Set();
  for (const term of toSet(terms)) {
    if (hasTermMatch(term, observableSet)) {
      result.add(term);
    }
  }
  return result;
};

const overlapCoverage = (jdSet, candidateSet) => {
  if (!jdSet.size) return 0;
  let matches = 0;
  for (const term of jdSet) {
    if (hasTermMatch(term, candidateSet)) matches += 1;
  }
  return matches / jdSet.size;
};

const percentileRank = (sortedValues, value) => {
  if (!sortedValues.length) return 0;
  let lower = 0;
  let equal = 0;

  for (const current of sortedValues) {
    if (current < value) {
      lower += 1;
      continue;
    }

    if (Math.abs(current - value) <= 1e-9) {
      equal += 1;
    }
  }

  // Mid-rank percentile reduces inflated 100s when many candidates tie.
  return (lower + (equal / 2)) / sortedValues.length;
};

const uniqueTerms = (...lists) => {
  const set = new Set();
  for (const list of lists) {
    for (const value of list || []) {
      const term = normalizeTerm(value);
      if (term) set.add(term);
    }
  }
  return set;
};

const getLeetcodeTags = (leetcodeMetrics) => {
  const advanced = leetcodeMetrics?.algorithms?.advanced || [];
  const intermediate = leetcodeMetrics?.algorithms?.intermediate || [];
  const fundamental = leetcodeMetrics?.algorithms?.fundamental || [];

  return [...advanced, ...intermediate, ...fundamental]
    .map((item) => normalizeTerm(item?.tagName))
    .filter(Boolean);
};

const getLeetcodeLanguages = (leetcodeMetrics) => {
  const langs = leetcodeMetrics?.languages || [];
  return langs
    .map((item) => normalizeTerm(item?.languageName))
    .filter(Boolean);
};

const getLanguageKeys = (languagePercentages) => {
  if (!languagePercentages) return [];
  if (languagePercentages instanceof Map) {
    return Array.from(languagePercentages.keys()).map(normalizeTerm).filter(Boolean);
  }
  if (typeof languagePercentages === "object") {
    return Object.keys(languagePercentages).map(normalizeTerm).filter(Boolean);
  }
  return [];
};

const buildCandidateVector = (analysis) => {
  const skills = (analysis?.rawMetrics?.skills || []).map(normalizeTerm).filter(Boolean);
  const frameworks = (analysis?.rawMetrics?.frameworks || []).map(normalizeTerm).filter(Boolean);
  const languages = [
    ...getLanguageKeys(analysis?.rawMetrics?.languagePercentages),
    ...getLeetcodeLanguages(analysis?.leetcodeMetrics)
  ];
  const leetcodeTags = getLeetcodeTags(analysis?.leetcodeMetrics);

  return {
    skills,
    frameworks,
    languages,
    leetcodeTags,
    allTerms: uniqueTerms(skills, frameworks, languages, leetcodeTags)
  };
};

const buildJdVector = (parsedJD) => ({
  skills: parsedJD.skills || [],
  frameworks: parsedJD.frameworks || [],
  languages: parsedJD.languages || [],
  keywords: parsedJD.keywords || []
});

const getMatchedAndMissing = (jdVector, candidateVector) => {
  const matched = [];
  const missing = [];

  const addTerms = (terms, bucketMatched, bucketMissing, matcherSet) => {
    for (const term of terms) {
      if (hasTermMatch(term, matcherSet)) bucketMatched.push(term);
      else bucketMissing.push(term);
    }
  };

  // Skills should be matched against all measurable evidence (GitHub + LeetCode tags/languages).
  const skillSet = toSet(candidateVector.allTerms);
  const frameworkSet = toSet(candidateVector.frameworks);
  const languageSet = toSet(candidateVector.languages);
  const allTermSet = candidateVector.allTerms;

  addTerms(jdVector.skills, matched, missing, skillSet);
  addTerms(jdVector.frameworks, matched, missing, frameworkSet);
  addTerms(jdVector.languages, matched, missing, languageSet);
  addTerms(jdVector.keywords, matched, missing, allTermSet);

  return {
    matchedFeatures: [...new Set(matched)],
    missingFeatures: [...new Set(missing)]
  };
};

const getObservableUniverse = (candidateVectors) => {
  const skills = new Set();
  const frameworks = new Set();
  const languages = new Set();
  const keywords = new Set();

  for (const vector of candidateVectors) {
    for (const term of vector.skills || []) skills.add(term);
    for (const term of vector.frameworks || []) frameworks.add(term);
    for (const term of vector.languages || []) languages.add(term);
    for (const term of vector.allTerms || []) keywords.add(term);
  }

  return { skills, frameworks, languages, keywords };
};

export const matchCandidatesForJD = async (jdText, { limit = 100 } = {}) => {
  const parsedJD = await parseJDWithGemini(jdText);
  const jdVector = buildJdVector(parsedJD);

  const analyses = await Analysis.find({ status: "completed" })
    .select("githubId username rawMetrics.skills rawMetrics.frameworks rawMetrics.languagePercentages leetcodeMetrics.username leetcodeMetrics.algorithms leetcodeMetrics.languages overallScore")
    .lean();

  const enriched = analyses.map((analysis) => ({
    analysis,
    candidateVector: buildCandidateVector(analysis)
  }));

  const observable = getObservableUniverse(enriched.map((item) => item.candidateVector));

  const jdSkillSet = getMeasurableTerms(jdVector.skills, observable.keywords);
  const jdFrameworkSet = setIntersection(toSet(jdVector.frameworks), observable.frameworks);
  // Keep JD languages as strict requirements so missing languages reduce score.
  const jdLanguageSet = toSet(jdVector.languages);
  const jdKeywordSet = getMeasurableTerms(jdVector.keywords, observable.keywords);

  const searchableJD = {
    skills: setToSortedArray(jdSkillSet),
    frameworks: setToSortedArray(jdFrameworkSet),
    languages: setToSortedArray(jdLanguageSet),
    keywords: setToSortedArray(jdKeywordSet)
  };

  const searchableJdVector = buildJdVector(searchableJD);

  const scored = enriched.map(({ analysis, candidateVector }) => {
    const allTermSet = toSet(candidateVector.allTerms);

    const skillScore = overlapCoverage(jdSkillSet, allTermSet);
    const frameworkScore = overlapCoverage(jdFrameworkSet, toSet(candidateVector.frameworks));
    const languageScore = overlapCoverage(jdLanguageSet, toSet(candidateVector.languages));
    const keywordScore = overlapCoverage(jdKeywordSet, allTermSet);

    const components = {
      skills: skillScore,
      frameworks: frameworkScore,
      languages: languageScore,
      keywords: keywordScore
    };

    return { analysis, candidateVector, components };
  });

  const activeComponents = [
    { key: "skills", active: jdSkillSet.size > 0 },
    { key: "frameworks", active: jdFrameworkSet.size > 0 },
    { key: "languages", active: jdLanguageSet.size > 0 },
    { key: "keywords", active: jdKeywordSet.size > 0 }
  ].filter((item) => item.active);

  const componentDistributions = {};
  for (const component of activeComponents) {
    componentDistributions[component.key] = scored
      .map((item) => item.components[component.key])
      .sort((a, b) => a - b);
  }

  const ranked = scored.map((item) => {
    const normalizedScores = activeComponents.map((component) => {
      const distribution = componentDistributions[component.key] || [];
      return percentileRank(distribution, item.components[component.key]);
    });

    const meanNormalized = normalizedScores.length
      ? normalizedScores.reduce((acc, current) => acc + current, 0) / normalizedScores.length
      : 0;

    const { matchedFeatures, missingFeatures } = getMatchedAndMissing(searchableJdVector, item.candidateVector);

    const totalRequirements =
      searchableJdVector.skills.length +
      searchableJdVector.frameworks.length +
      searchableJdVector.languages.length +
      searchableJdVector.keywords.length;

    const requirementCoverage = totalRequirements
      ? matchedFeatures.length / totalRequirements
      : 1;

    // Display score should reflect requirement coverage directly.
    // If nothing is missing, this becomes 100.
    const coverageScore = Math.pow(requirementCoverage, 0.7) * 100;

    return {
      userId: item.analysis.githubId,
      username: item.analysis.username,
      leetcodeUsername: item.analysis.leetcodeMetrics?.username || null,
      matchScore: Number(coverageScore.toFixed(2)),
      matchedFeatures,
      missingFeatures,
      _qualityTiebreaker: Number((meanNormalized * 100).toFixed(4)),
      _tiebreaker: Number(item.analysis.overallScore || 0)
    };
  });

  ranked.forEach((c) => {

    c.finalScore =
      0.65 * c.matchScore +
      0.25 * c._qualityTiebreaker +
      0.10 * c._tiebreaker;

    if (c.matchScore > 85) {
      c.finalScore += 0.15 * c._tiebreaker;
    }

  });

  ranked.sort((a, b) => b.finalScore - a.finalScore);

  // ranked.sort((a, b) => {
  //   if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
  //   if (b._qualityTiebreaker !== a._qualityTiebreaker) return b._qualityTiebreaker - a._qualityTiebreaker;
  //   return b._tiebreaker - a._tiebreaker;
  // });

  return {
    parsedJD,
    searchableJD,
    results: ranked
      .slice(0, Math.max(1, Number(limit) || 100))
      .map(({ _qualityTiebreaker, _tiebreaker, finalScore, ...rest }) => ({
        ...rest,
        finalScore: Number(finalScore.toFixed(2))
      }))
  };
};
