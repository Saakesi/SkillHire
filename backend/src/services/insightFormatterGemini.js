import { generateGeminiJson, generateGeminiText } from "./geminiClient.js";

const metricActionMap = {
  activityScore: "Ship code on at least 4 days each week and keep commit frequency steady.",
  consistencyScore: "Avoid long gaps by maintaining a weekly commit streak and even contribution cadence.",
  collaborationScore: "Increase collaborative work by opening and reviewing more pull requests with clear context.",
  codeReviewScore: "Review at least 2-3 PRs per week and leave specific, actionable review comments.",
  projectQualityScore: "Raise quality signals with stronger README, tests, CI checks, and deployment hygiene.",
  languageDiversityScore: "Build one project or module in a secondary language to improve diversity.",
  frameworkScore: "Add depth in one additional framework and demonstrate it with production-ready repos.",
  repoScore: "Publish complete projects with clear outcomes rather than partial or experimental repos.",
  starScore: "Create more discoverable repos with better docs, demos, and sharing cadence to grow stars.",
  forkScore: "Contribute to repos where your work is reused and encourage external collaboration.",
  leetcodeScore: "Solve higher-difficulty sets weekly and track improvements in contests and patterns.",
  commitCount6Months: "Set a weekly commit target and maintain it over multiple months.",
  activeWeeks: "Reduce inactive weeks by scheduling at least one meaningful coding session each week.",
  repoCount: "Increase high-quality repository count with focused, well-documented projects.",
  prCount: "Open smaller, frequent pull requests to increase review velocity and collaboration footprint.",
  reviewsGiven: "Give consistent code reviews with concrete change requests and architecture feedback.",
  leetcodeSolvedTotal: "Sustain a weekly solve plan across mixed topics to keep volume and retention high.",
  leetcodeContestRating: "Participate in contests consistently and post-upsolve sessions after each contest."
};

const buildActionSuggestion = (item) => {
  const metricKey = String(item.metric || "").trim();
  const mapped = metricActionMap[metricKey];
  if (mapped) return mapped;
  return "Take one measurable weekly action in this area and track progress across the next month.";
};

const isActionableSuggestion = (text) => {
  const value = String(text || "").trim();
  if (!value) return false;

  const actionVerb = /(ship|review|open|increase|reduce|set|schedule|participate|publish|track|add|solve|improve|create|document|test|deploy|mentor|refactor)/i;
  const timeOrTarget = /(weekly|each week|per week|month|target|at least|\d+)/i;
  return actionVerb.test(value) && timeOrTarget.test(value);
};

const improveSuggestion = (item, suggestion) => {
  if (isActionableSuggestion(suggestion)) return suggestion;

  const action = buildActionSuggestion(item);
  if (item?.priority === "critical") {
    return `${action} Prioritize this now because it has high score impact.`;
  }
  if (item?.priority === "moderate") {
    return `${action} Improving this can move you toward top-tier performance.`;
  }
  return `${action} Maintain this and redirect extra effort to lower-priority metrics.`;
};

const fallbackInsight = (item) => {
  const percentile = Number(item.percentile || 0).toFixed(1);
  const metricLabel = item.metricLabel || item.metric;
  const base = `${metricLabel}: ${item.userValue} (${percentile} percentile, ${item.context}).`;

  let suggestion = buildActionSuggestion(item);
  if (item.percentile >= 70) {
    suggestion = `${buildActionSuggestion(item)} This helps preserve your top-tier standing.`;
  } else if (item.percentile >= 50) {
    suggestion = `${buildActionSuggestion(item)} This should move you from around-median toward top quartile.`;
  } else if (item.percentile <= 25) {
    suggestion = `${buildActionSuggestion(item)} This is the fastest way to improve score in this dimension.`;
  }

  suggestion = improveSuggestion(item, suggestion);

  return {
    category: item.category,
    observation: base,
    suggestion
  };
};

const pickRowsFromPayload = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.insights)) return payload.insights;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.result)) return payload.result;

  if (payload && typeof payload === "object") {
    const entries = Object.entries(payload)
      .filter(([, value]) => value && typeof value === "object")
      .map(([category, value]) => ({
        category,
        observation: value.observation || value.insight || value.summary || "",
        suggestion: value.suggestion || value.recommendation || value.action || value.nextStep || ""
      }))
      .filter((row) => row.observation || row.suggestion);

    if (entries.length) return entries;
  }

  return null;
};

const normalizeText = (value) => (typeof value === "string" ? value.trim() : "");

const validateInsightRows = (payload, sourceObjects = []) => {
  const rows = pickRowsFromPayload(payload);
  if (!Array.isArray(rows)) return null;

  const valid = rows
    .filter((row) => row && typeof row === "object")
    .map((row, index) => {
      const fallback = sourceObjects[index] || {};
      const category =
        normalizeText(row.category) ||
        normalizeText(row.section) ||
        normalizeText(fallback.category);

      const observation =
        normalizeText(row.observation) ||
        normalizeText(row.insight) ||
        normalizeText(row.summary) ||
        normalizeText(row.note);

      const suggestion =
        normalizeText(row.suggestion) ||
        normalizeText(row.recommendation) ||
        normalizeText(row.action) ||
        normalizeText(row.nextStep) ||
        "Keep improving this area with focused weekly practice.";

      return {
        category,
        observation,
        suggestion: improveSuggestion(fallback, suggestion)
      };
    })
    .filter((row) => row.category && row.observation);

  return valid.length ? valid : null;
};

const parsePipeRows = (text = "") => {
  const rows = [];
  const lines = String(text)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    const normalized = line.replace(/^[-*\d.)\s]+/, "").trim();
    const parts = normalized.split("|").map((part) => part.trim());
    if (parts.length < 3) continue;

    rows.push({
      category: parts[0],
      observation: parts[1],
      suggestion: parts.slice(2).join(" | ")
    });
  }

  return rows.length ? rows : null;
};

export const formatInsightsWithGemini = async (insightObjects) => {
  const safeInput = Array.isArray(insightObjects) ? insightObjects : [];
  if (!safeInput.length) return [];

  const prompt = `You are generating developer insights.

Rules:
- DO NOT invent numbers
- DO NOT hallucinate
- ONLY use provided data
- Keep suggestions practical, direct, and score-oriented
- Prefer metricLabel over metric key names
- Avoid repeating very similar observations across different rows
- Return the same number of rows as provided in Input
- Return JSON array only
- Each suggestion must include one concrete weekly action
- Do not use generic advice like "keep it up" without a specific action
- Use category from input; keep it short

Input:
${JSON.stringify(safeInput)}

Return:
[
  {
    "category": "",
    "observation": "",
    "suggestion": ""
  }
]`;

  const geminiResult = await generateGeminiJson(prompt, { maxOutputTokens: 1600 });
  const validated = validateInsightRows(geminiResult, safeInput);

  if (validated) {
    if (validated.length < safeInput.length) {
      console.warn("Gemini insights partial response: filling remaining with fallback text");
      const fallbacks = safeInput.slice(validated.length).map(fallbackInsight);
      return [...validated, ...fallbacks];
    }

    return validated.slice(0, safeInput.length);
  }

  // Secondary path: ask Gemini for plain text rows and parse them.
  const plainPrompt = `Rewrite these developer insight rows as concise natural language.

Output format rules:
- Return exactly ${safeInput.length} lines
- Each line must be: category | observation | suggestion
- Do not add markdown/code fences/explanations

Rows:
${safeInput.map((item) => `${item.category} | ${item.metricLabel || item.metric}: ${item.userValue}, ${item.percentile} percentile (${item.context})`).join("\n")}`;

  const textResult = await generateGeminiText(plainPrompt, { maxOutputTokens: 1400 });
  const parsedRows = parsePipeRows(textResult || "");
  const validatedTextRows = validateInsightRows(parsedRows, safeInput);

  if (validatedTextRows) {
    if (validatedTextRows.length < safeInput.length) {
      const fallbacks = safeInput.slice(validatedTextRows.length).map(fallbackInsight);
      return [...validatedTextRows, ...fallbacks];
    }
    return validatedTextRows.slice(0, safeInput.length);
  }

  console.warn("Gemini insights fallback used: both JSON and text parsing failed");
  return safeInput.map(fallbackInsight);
};
