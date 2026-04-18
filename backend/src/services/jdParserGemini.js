import crypto from "crypto";
import { cacheGet, cacheSet } from "./cache/cacheService.js";
import { generateGeminiJson } from "./geminiClient.js";

const JD_PARSE_TTL_SECONDS = 60 * 60 * 6;

const uniqueNormalized = (values) => {
  if (!Array.isArray(values)) return [];
  const out = [];
  const seen = new Set();

  for (const value of values) {
    if (typeof value !== "string") continue;
    const normalized = value.trim().toLowerCase();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    out.push(normalized);
  }

  return out;
};

const validateParsedJD = (obj) => ({
  skills: uniqueNormalized(obj?.skills),
  frameworks: uniqueNormalized(obj?.frameworks),
  languages: uniqueNormalized(obj?.languages),
  keywords: uniqueNormalized(obj?.keywords)
});

const buildPrompt = (jdText) => `Extract structured hiring requirements from this job description.

Rules:
- Only return JSON
- Do NOT include explanation
- Only include technical terms

Return format:
{
  "skills": [],
  "frameworks": [],
  "languages": [],
  "keywords": []
}

JD:
${jdText}`;

export const parseJDWithGemini = async (jdText) => {
  const input = String(jdText || "").trim();
  if (!input) {
    return { skills: [], frameworks: [], languages: [], keywords: [] };
  }

  const hash = crypto.createHash("sha256").update(input).digest("hex");
  const cacheKey = `jd:parse:${hash}`;

  const cached = await cacheGet(cacheKey);
  if (cached) {
    return validateParsedJD(cached);
  }

  const parsed = await generateGeminiJson(buildPrompt(input), { maxOutputTokens: 1200 });
  const validated = validateParsedJD(parsed);

  await cacheSet(cacheKey, validated, JD_PARSE_TTL_SECONDS);
  return validated;
};
