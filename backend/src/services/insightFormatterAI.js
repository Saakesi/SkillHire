import { generateAIJson, generateAIText } from "./aiClient.js";

const metricActionMap = {
  activityScore: "Ship code regularly and maintain consistent commit frequency.",
  consistencyScore: "Maintain a regular commit streak and avoid long gaps in contributions.",
  collaborationScore: "Increase collaborative work by opening and reviewing pull requests with clear context.",
  codeReviewScore: "Leave specific, actionable review comments on pull requests.",
  projectQualityScore: "Raise quality signals with stronger README, tests, CI checks, and deployment hygiene.",
  languageDiversityScore: "Build projects in secondary languages to improve diversity.",
  frameworkScore: "Add depth in additional frameworks with production-ready repositories.",
  repoScore: "Publish complete projects with clear outcomes rather than partial or experimental repos.",
  starScore: "Create discoverable repos with better documentation and sharing.",
  forkScore: "Contribute to repos where your work is reused and encourage collaboration.",
  leetcodeScore: "Solve higher-difficulty problem sets and track improvements.",
  commitCount6Months: "Maintain consistent commits over time.",
  activeWeeks: "Schedule coding sessions regularly to reduce inactive weeks.",
  repoCount: "Increase repository count with focused, well-documented projects.",
  prCount: "Open frequent pull requests to increase review velocity and collaboration.",
  reviewsGiven: "Give consistent code reviews with concrete, actionable feedback.",
  leetcodeSolvedTotal: "Sustain a regular solve plan across mixed topics.",
  leetcodeContestRating: "Participate in contests consistently."
};

const buildActionSuggestion = (item) => {
  const metricKey = String(item.metric || "").trim();
  const mapped = metricActionMap[metricKey];
  if (mapped) return mapped;
  return "Take one measurable weekly action in this area and track progress across the next month.";
};

const isActionableSuggestion = (text = "") => {
  const value = String(text || "").trim();
  if (!value) return false;

  const actionVerb = /(ship|review|open|increase|reduce|set|schedule|participate|publish|track|add|solve|improve|create|document|test|deploy|mentor|refactor|write|build|submit)/i;
  const cadence = /(weekly|each week|per week|every week|daily|every day|monthly|each month|every month|once a week|once a month)/i;
  const hasNumberToken = /(?:\b(?:zero|one|two|three|four|five|six|seven|eight|nine|ten|first|second|third|fourth|fifth)\b|\d+)/i.test(value);
  return actionVerb.test(value) && cadence.test(value) && !hasNumberToken;
};

const isGenericSuggestion = (text = "") => {
  const value = String(text || "").trim();
  if (!value) return true;

  return /(?:improve\s+(?:the\s+)?(?:quality|score)|increase\s+(?:the\s+)?(?:number|count|score)|practice\s+consistently|continue\s+to\s+maintain|maintain\s+a\s+good|to\s+improve\s+(?:performance|rating|score))/i.test(value);
};

const buildConcreteFallbackSuggestion = (item) => {
  const base = buildActionSuggestion(item);
  if (item?.priority === "critical") {
    return `${base} Set a weekly target and review progress at the end of each week.`;
  }
  if (item?.priority === "moderate") {
    return `${base} Track this each week and adjust after a short cycle.`;
  }
  return `${base} Keep a lightweight weekly checklist to sustain momentum.`;
};

const removeNumbersFromSuggestion = (text = "") => String(text || "")
  .replace(/\d+/g, "")
  .replace(/\b(?:zero|one|two|three|four|five|six|seven|eight|nine|ten|first|second|third|fourth|fifth)\b/gi, "")
  .replace(/\bat\s+least\s+(?=[a-z])/gi, "regular ")
  .replace(/\bevery\s*-\s*weeks?\b/gi, "weekly")
  .replace(/\s+,/g, ",")
  .replace(/\s+\./g, ".")
  .replace(/\s{2,}/g, " ")
  .trim();

const improveSuggestion = (item, suggestion) => {
  const cleaned = String(suggestion || "").trim();
  if (cleaned) return cleaned;

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
  if (Array.isArray(payload)) return payload.length > 0 ? payload : null;
  if (Array.isArray(payload?.insights)) return payload.insights.length > 0 ? payload.insights : null;
  if (Array.isArray(payload?.data)) return payload.data.length > 0 ? payload.data : null;
  if (Array.isArray(payload?.result)) return payload.result.length > 0 ? payload.result : null;

  if (payload && typeof payload === "object") {
    // Reject empty objects
    if (Object.keys(payload).length === 0) return null;

    // Check if this is a single insight object (not a collection)
    if (payload.category && payload.observation !== undefined) {
      return [payload];
    }

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

const extractLikelyJson = (text = "") => {
  const input = String(text || "").trim();
  if (!input) return "";

  const fenced = input.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const startCandidates = [input.indexOf("{"), input.indexOf("[")]
    .filter((idx) => idx >= 0)
    .sort((a, b) => a - b);

  if (!startCandidates.length) return "";

  const start = startCandidates[0];
  const opening = input[start];
  const closing = opening === "{" ? "}" : "]";

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < input.length; i++) {
    const ch = input[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }

    if (ch === opening) depth += 1;
    if (ch === closing) {
      depth -= 1;
      if (depth === 0) {
        return input.slice(start, i + 1);
      }
    }
  }

  return "";
};

const parseRowsFromTextJson = (text = "") => {
  const candidate = extractLikelyJson(text);
  if (!candidate) return null;

  try {
    return pickRowsFromPayload(JSON.parse(candidate));
  } catch {
    return null;
  }
};

const looksJsonLike = (text = "") => /^[\s\r\n]*[\[{]/.test(String(text || ""));

const isJsonFragmentLine = (text = "") => {
  const value = String(text || "").trim();
  if (!value) return true;
  if (value === "[" || value === "]" || value === "{" || value === "}") return true;
  if (/^\{\s*"[^"]+"\s*:/.test(value)) return true;
  if (/^[\[\]{}",:]+$/.test(value)) return true;
  return false;
};

const normalizeText = (value) => (typeof value === "string" ? value.trim() : "");

const normalizeRow = (row, fallback) => {
  if (typeof row === "string") {
    const line = normalizeText(row);
    if (!line) return null;
    if (isJsonFragmentLine(line)) return null;

    const parts = line.split("|").map((part) => part.trim()).filter(Boolean);
    if (parts.length >= 3) {
      return {
        category: parts[0],
        observation: parts[1],
        suggestion: parts.slice(2).join(" | ")
      };
    }

    return {
      category: normalizeText(fallback?.category),
      observation: line,
      suggestion: normalizeText(fallback?.suggestion) || "Keep improving this area with focused weekly practice."
    };
  }

  if (!row || typeof row !== "object") return null;

  return {
    category: normalizeText(row.category) || normalizeText(row.section) || normalizeText(fallback?.category),
    observation:
      normalizeText(row.observation) ||
      normalizeText(row.insight) ||
      normalizeText(row.summary) ||
      normalizeText(row.note),
    suggestion:
      normalizeText(row.suggestion) ||
      normalizeText(row.recommendation) ||
      normalizeText(row.action) ||
      normalizeText(row.nextStep) ||
      "Keep improving this area with focused weekly practice."
  };
};

const validateInsightRows = (payload, sourceObjects = []) => {
  const rows = pickRowsFromPayload(payload);
  if (!Array.isArray(rows)) return null;

  const valid = rows
    .map((row, index) => {
      const fallback = sourceObjects[index] || {};
      const normalized = normalizeRow(row, fallback);
      if (!normalized) return null;

      return {
        category: normalized.category,
        observation: normalized.observation,
        suggestion: improveSuggestion(fallback, normalized.suggestion)
      };
    })
    .filter(Boolean)
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
    if (parts.length < 2) continue;

    rows.push({
      category: parts[0],
      observation: parts[1],
      suggestion: parts.slice(2).join(" | ") || "Keep improving this area with focused weekly practice."
    });
  }

  return rows.length ? rows : null;
};

const parseLabeledRows = (text = "") => {
  const chunks = String(text || "")
    .split(/\n\s*\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  const rows = [];

  for (const chunk of chunks) {
    const categoryMatch = chunk.match(/(?:^|\n)\s*(?:category|section)\s*[:\-]\s*(.+)/i);
    const observationMatch = chunk.match(/(?:^|\n)\s*(?:observation|insight|summary|note)\s*[:\-]\s*([\s\S]*?)(?:\n\s*(?:suggestion|recommendation|action|next\s*step)\s*[:\-]|$)/i);
    const suggestionMatch = chunk.match(/(?:^|\n)\s*(?:suggestion|recommendation|action|next\s*step)\s*[:\-]\s*([\s\S]*)/i);

    if (!observationMatch) continue;

    rows.push({
      category: categoryMatch?.[1]?.trim() || "",
      observation: observationMatch?.[1]?.trim() || "",
      suggestion: suggestionMatch?.[1]?.trim() || ""
    });
  }

  return rows.length ? rows : null;
};

const parseBulletRows = (text = "") => {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^[-*\d.)\s]+/, "").trim());

  const rows = [];
  for (const line of lines) {
    if (!line) continue;

    const parts = line
      .split(/\s+-\s+/)
      .map((part) => part.trim())
      .filter(Boolean);

    if (parts.length >= 3) {
      rows.push({
        category: parts[0],
        observation: parts[1],
        suggestion: parts.slice(2).join(" - ")
      });
      continue;
    }

    rows.push(line);
  }

  return rows.length ? rows : null;
};

const parseParagraphBlocks = (text = "") => {
  const chunks = String(text || "")
    .split(/\n\s*\n+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  const ignoreLines = new Set([
    "developer diagnosis",
    "output"
  ]);

  const rows = [];

  for (const chunk of chunks) {
    const lines = chunk
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((line) => !ignoreLines.has(line.toLowerCase()));

    if (lines.length < 4) continue;
    if (!lines.some((line) => /^(category|section|observation|insight|summary|note|suggestion|recommendation|action|next\s*step)\s*[:\-]/i.test(line))) {
      continue;
    }

    const metricLabel = lines[0] || "";
    const category = lines[1] || "";
    const priorityLine = lines[2] || "";
    const observation = lines[3] || "";
    const suggestion = lines.slice(4).join(" ") || "";

    if (!observation || !suggestion) continue;

    rows.push({
      category: category || metricLabel,
      observation: `${metricLabel ? `${metricLabel} | ` : ""}${observation}`,
      suggestion: priorityLine ? `${suggestion} ${priorityLine}.` : suggestion
    });
  }

  return rows.length ? rows : null;
};

const parseAiInsightPayload = (response) => {
  if (Array.isArray(response)) return response;
  if (response && typeof response === "object") return response;

  const text = String(response || "").trim();
  if (!text) return null;

  const jsonRows = parseRowsFromTextJson(text);
  if (jsonRows) return jsonRows;

  // If it looks like JSON but couldn't be parsed, do not treat lines as insights.
  if (looksJsonLike(text)) return null;

  return (
    parsePipeRows(text) ||
    parseLabeledRows(text) ||
    parseBulletRows(text) ||
    parseParagraphBlocks(text)
  );
};

const parseSuggestionRewritePayload = (response) => {
  if (!response) return null;

  if (Array.isArray(response)) return response;

  if (response && typeof response === "object") {
    if (Array.isArray(response.rewrites)) return response.rewrites;
    if (Array.isArray(response.data)) return response.data;
  }

  const text = String(response || "").trim();
  if (!text) return null;

  const candidate = extractLikelyJson(text);
  if (!candidate) return null;

  try {
    const parsed = JSON.parse(candidate);
    if (Array.isArray(parsed)) return parsed;
    if (Array.isArray(parsed?.rewrites)) return parsed.rewrites;
    if (Array.isArray(parsed?.data)) return parsed.data;
    return null;
  } catch {
    return null;
  }
};

const recoverInsightsFromTextRows = async (sourceObjects = []) => {
  if (!Array.isArray(sourceObjects) || !sourceObjects.length) return null;

  const recoveryPrompt = `Generate exactly ${sourceObjects.length} developer insights as plain text rows.

CRITICAL RULES:
1. Output exactly ${sourceObjects.length} lines
2. Each line format: category | observation | suggestion
3. Do not output JSON, markdown, bullets, or numbering
4. Use only information present in INPUT DATA
5. Keep order exactly the same as INPUT DATA

INPUT DATA:
${JSON.stringify(sourceObjects, null, 2)}

Return only the lines.`;

  const recoveryText = await generateAIText(recoveryPrompt, { maxOutputTokens: 1400 });
  if (!recoveryText) return null;

  const parsedRows = parsePipeRows(recoveryText) || parseLabeledRows(recoveryText) || parseBulletRows(recoveryText);
  const validated = validateInsightRows(parsedRows, sourceObjects);
  if (!validated) return null;

  return validated.slice(0, sourceObjects.length);
};

const upgradeWeakSuggestionsWithAI = async (rows = [], sourceObjects = []) => {
  if (!Array.isArray(rows) || !rows.length) return rows;

  const weakIndexes = rows
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => !isActionableSuggestion(row?.suggestion) || isGenericSuggestion(row?.suggestion))
    .map(({ index }) => index);

  if (!weakIndexes.length) return rows;

  const rewriteInput = weakIndexes.map((index) => ({
    index,
    category: rows[index].category,
    observation: rows[index].observation,
    suggestion: rows[index].suggestion,
    metric: sourceObjects[index]?.metric,
    metricLabel: sourceObjects[index]?.metricLabel,
    userValue: sourceObjects[index]?.userValue,
    percentile: sourceObjects[index]?.percentile,
    priority: sourceObjects[index]?.priority
  }));

  const rewritePrompt = `Rewrite weak developer suggestions to be concrete and usable.

CRITICAL RULES:
1. Return a valid JSON array with exactly ${weakIndexes.length} objects
2. Each object must include: index, suggestion
3. Keep each index exactly the same as provided in input
4. Rewrite suggestion to include a concrete action and cadence (weekly/daily/monthly)
5. Do not use generic phrases like "improve score", "practice consistently", "continue to maintain"
6. Do not mention percentile/median/low/high in suggestion
7. Do not include any numbers in suggestion (digits or number words)
8. Keep each suggestion concise (one sentence, max 24 words)
9. Do not invent any metrics not present in the input

INPUT DATA:
${JSON.stringify(rewriteInput, null, 2)}

Return ONLY the JSON array. No markdown, no code fences, no explanation.`;

  const rewriteText = await generateAIText(rewritePrompt, { maxOutputTokens: 900 });
  const rewriteJson = rewriteText ? null : await generateAIJson(rewritePrompt, { maxOutputTokens: 900 });
  const rewriteResult = rewriteText || rewriteJson;
  const rewrites = parseSuggestionRewritePayload(rewriteResult);
  const rewriteMap = new Map();
  for (const row of rewrites || []) {
    const index = Number(row?.index);
    const suggestion = String(row?.suggestion || "").trim();
    if (!Number.isInteger(index)) continue;
    if (!weakIndexes.includes(index)) continue;
    if (!suggestion) continue;
    rewriteMap.set(index, suggestion);
  }

  return rows.map((row, index) => {
    if (!weakIndexes.includes(index)) return row;

    const originalSanitized = removeNumbersFromSuggestion(row.suggestion);
    const fromAI = rewriteMap.get(index);
    if (fromAI) {
      const sanitized = removeNumbersFromSuggestion(fromAI);

      // Prefer rewritten suggestion; keep it even if not strongly actionable,
      // and only fallback when rewrite turns empty.
      if (sanitized) {
        return {
          category: row.category,
          observation: row.observation,
          suggestion: sanitized
        };
      }

      return {
        category: row.category,
        observation: row.observation,
        suggestion: originalSanitized || buildConcreteFallbackSuggestion(sourceObjects[index])
      };
    }

    // If rewrite call fails or returns nothing, keep the original AI suggestion.
    if (originalSanitized) {
      return {
        category: row.category,
        observation: row.observation,
        suggestion: originalSanitized
      };
    }

    return {
      category: row.category,
      observation: row.observation,
      suggestion: buildConcreteFallbackSuggestion(sourceObjects[index])
    };
  });
};

export const formatInsightsWithAI = async (insightObjects) => {
  const safeInput = Array.isArray(insightObjects) ? insightObjects : [];
  if (!safeInput.length) return [];

  // Build performance context helper
  const buildPerformanceContext = (item) => {
    const p = Number(item.percentile || 0);
    if (p >= 80) return "Top-tier performance";
    if (p >= 60) return "Above average";
    if (p >= 40) return "Mid-range";
    return "Below average";
  };

  // Generate a concrete example
  const exampleItem = safeInput[0];
  const exampleOutput = {
    category: exampleItem.category,
    observation: `${exampleItem.metricLabel} is currently ${buildPerformanceContext(exampleItem).toLowerCase()}`,
    suggestion: buildActionSuggestion(exampleItem)
  };

  const prompt = `Generate exactly ${safeInput.length} developer insight objects.

CRITICAL RULES:
1. MUST return a valid JSON array with exactly ${safeInput.length} objects
2. MUST NOT return empty objects, {} or null
3. MUST include all three fields in each object: category, observation, suggestion
4. DO NOT invent numbers, percentages, or made-up metrics
5. DO NOT add information not provided in the input
6. Produce one insight for every input row, in the same order
7. Use the provided category for each object and reference the metricLabel exactly as provided in the observation
8. Suggestion must be an actionable tip with a concrete activity and cadence
9. Do not write vague suggestions like "improve score" or "practice consistently"
10. Do not repeat score status (low/median/high) in the suggestion
11. Do not include any numbers in the suggestion (digits or number words)

INPUT DATA:
${JSON.stringify(safeInput, null, 2)}

EXAMPLE OUTPUT (for reference):
[${JSON.stringify(exampleOutput)}]

Return ONLY the JSON array. No markdown, no code fences, no explanation.`;

  const aiTextResult = await generateAIText(prompt, { maxOutputTokens: 1600 });
  let aiResult = aiTextResult;
  let parsedPayload = parseAiInsightPayload(aiResult);

  // If text output looked JSON-like but parsing failed, retry via strict JSON generation.
  if (!parsedPayload) {
    const aiJsonResult = await generateAIJson(prompt, { maxOutputTokens: 1600 });
    if (aiJsonResult) {
      aiResult = aiJsonResult;
      parsedPayload = parseAiInsightPayload(aiResult);
    }
  }

  console.log("Dev insight AI output:", typeof aiResult === "string" ? aiResult : JSON.stringify(aiResult, null, 2));
  const validated = validateInsightRows(parsedPayload, safeInput)?.map((row) => ({
    ...row,
    suggestion: removeNumbersFromSuggestion(row.suggestion)
  }));

  if (validated) {
    const upgraded = await upgradeWeakSuggestionsWithAI(validated, safeInput);

    if (validated.length < safeInput.length) {
      const missingInputs = safeInput.slice(validated.length);
      const recoveredMissing = await recoverInsightsFromTextRows(missingInputs);

      if (recoveredMissing?.length) {
        const upgradedRecovered = await upgradeWeakSuggestionsWithAI(recoveredMissing, missingInputs);
        const recoveredSlice = upgradedRecovered.slice(0, missingInputs.length);
        const stillMissing = missingInputs.slice(recoveredSlice.length).map(fallbackInsight);
        if (stillMissing.length) {
          console.warn("AI insights partial response: recovered some rows, filling remaining with fallback");
        }
        return [...upgraded.slice(0, validated.length), ...recoveredSlice, ...stillMissing];
      }

      console.warn("AI insights partial response: filling remaining with fallback");
      const fallbacks = missingInputs.map(fallbackInsight);
      return [...upgraded.slice(0, validated.length), ...fallbacks];
    }
    return upgraded.slice(0, safeInput.length);
  }

  // If first parse failed entirely, try one strict text-row recovery before full fallback.
  const recoveredAll = await recoverInsightsFromTextRows(safeInput);
  if (recoveredAll?.length) {
    const upgradedRecoveredAll = await upgradeWeakSuggestionsWithAI(recoveredAll, safeInput);
    if (upgradedRecoveredAll.length < safeInput.length) {
      const remainingFallbacks = safeInput.slice(upgradedRecoveredAll.length).map(fallbackInsight);
      return [...upgradedRecoveredAll, ...remainingFallbacks];
    }
    return upgradedRecoveredAll.slice(0, safeInput.length);
  }

  // JSON generation failed; use fallback insights directly (avoid second API call)
  console.warn("AI insights JSON generation failed; using fallback insights");
  return safeInput.map(fallbackInsight);
};
