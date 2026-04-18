import crypto from "crypto";
import { cacheGet, cacheSet } from "./cache/cacheService.js";
import { generateAIJson } from "./aiClient.js";

const JD_PARSE_TTL_SECONDS = 60 * 60 * 6;
const JD_PARSE_SCHEMA_VERSION = "v2";

const TERM_ALIASES = {
  js: "javascript",
  ts: "typescript",
  py: "python",
  "c plus plus": "c++",
  cpp: "c++",
  "node": "node.js",
  "nodejs": "node.js",
  "vue": "vue.js",
  "vue js": "vue.js",
  "angularjs": "angular",
  html5: "html",
  css3: "css",
  postgresql: "postgres",
  mysql: "sql",
  sqlite: "sql",
  mssql: "sql",
  "sql server": "sql",
  oop: "object-oriented design",
  oops: "object-oriented design",
  "object oriented programming": "object-oriented design",
  "object-oriented programming": "object-oriented design",
  "object oriented design": "object-oriented design"
};

const NON_TECH_PATTERNS = [
  /self\s*motivation/i,
  /self\s*starter/i,
  /communication/i,
  /collaborat/i,
  /ability\s+to\s+quickly\s+learn/i,
  /ability\s+to\s+thrive/i,
  /fast[-\s]*paced/i,
  /academic/i,
  /professional\/?internship/i,
  /college|university|graduate/i,
  /eligibility|criteria/i
];

const TECH_HINT = /(html|css|javascript|typescript|python|java|c\+\+|node|react|angular|vue|sql|database|algorithm|data structure|complexity|object-oriented|distributed|testing|monitoring|cloud|aws|docker|kubernetes|rest|graphql|git|mongodb|postgres|redis)/i;

const HARD_CODED_SKILLS = [
  "javascript", "typescript", "python", "java", "c++", "html", "css",
  "react", "angular", "vue.js", "node.js", "express", "next.js",
  "sql", "mongodb", "postgres", "redis", "rest", "graphql",
  "object-oriented design", "data structures", "algorithm development", "complexity analysis",
  "distributed systems", "automated testing", "testing infrastructure", "real-time monitoring", "cloud services"
];

const HARD_CODED_FRAMEWORKS = [
  "react", "angular", "vue.js", "next.js", "express"
];

const HARD_CODED_LANGUAGES = [
  "javascript", "typescript", "python", "java", "c++", "html", "css"
];

const HARD_CODED_KEYWORDS = [
  ...HARD_CODED_SKILLS,
  "relational database concepts",
  "problem-solving",
  "web development"
];

const normalizeTerm = (value) => {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return "";
  const compact = raw.replace(/\s+/g, " ");
  return TERM_ALIASES[compact] || compact;
};

const isLikelyTechnicalTerm = (value) => {
  const term = normalizeTerm(value);
  if (!term) return false;
  if (NON_TECH_PATTERNS.some((pattern) => pattern.test(term))) return false;
  return TECH_HINT.test(term) || term.includes("problem-solving");
};

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const hasTerm = (text, term) => {
  const escaped = escapeRegex(term);
  const pattern = new RegExp(`(^|[^a-z0-9+#.])${escaped}([^a-z0-9+#.]|$)`, "i");
  return pattern.test(text);
};

const uniqueNormalized = (values) => {
  if (!Array.isArray(values)) return [];
  const out = [];
  const seen = new Set();

  for (const value of values) {
    if (typeof value !== "string") continue;
    const normalized = normalizeTerm(value);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    out.push(normalized);
  }

  return out;
};

const validateParsedJD = (obj) => {
  const rawSkills = uniqueNormalized(obj?.skills);
  const rawFrameworks = uniqueNormalized(obj?.frameworks);
  const rawLanguages = uniqueNormalized(obj?.languages);
  const rawKeywords = uniqueNormalized(obj?.keywords);

  const skills = rawSkills.filter(isLikelyTechnicalTerm);
  const frameworks = rawFrameworks.filter(isLikelyTechnicalTerm);
  const languages = rawLanguages.filter(isLikelyTechnicalTerm);
  const keywords = rawKeywords.filter(isLikelyTechnicalTerm);

  const dropped = {
    skills: rawSkills.filter((term) => !skills.includes(term)),
    frameworks: rawFrameworks.filter((term) => !frameworks.includes(term)),
    languages: rawLanguages.filter((term) => !languages.includes(term)),
    keywords: rawKeywords.filter((term) => !keywords.includes(term))
  };

  if (dropped.skills.length || dropped.frameworks.length || dropped.languages.length || dropped.keywords.length) {
    console.log("JD parser dropped non-technical terms:", JSON.stringify(dropped, null, 2));
  }

  return { skills, frameworks, languages, keywords };
};

const mergeParsedJD = (aiParsed, hardcodedParsed) => ({
  skills: uniqueNormalized([...(aiParsed?.skills || []), ...(hardcodedParsed?.skills || [])]),
  frameworks: uniqueNormalized([...(aiParsed?.frameworks || []), ...(hardcodedParsed?.frameworks || [])]),
  languages: uniqueNormalized([...(aiParsed?.languages || []), ...(hardcodedParsed?.languages || [])]),
  keywords: uniqueNormalized([...(aiParsed?.keywords || []), ...(hardcodedParsed?.keywords || [])])
});

const buildPrompt = (jdText) => `Extract structured hiring requirements from this job description.

Rules:
- Only return JSON with actual terms found in the JD
- Do NOT invent, assume, or hallucinate terms not explicitly mentioned
- Do NOT include explanation or commentary
- Only include concrete technical terms
- Do NOT include soft skills like communication, self-motivation, adaptability, analytical mindset
- Include web technologies explicitly when present (HTML, CSS, JavaScript, React, Angular, Vue)
- Prefer normalized canonical names: c++, node.js, vue.js, object-oriented design

Return format:
{
  "skills": [],
  "frameworks": [],
  "languages": [],
  "keywords": []
}

JD:
${jdText}`;

const parseHardcodedJD = (jdText) => {
  const text = String(jdText || "").toLowerCase();

  const foundSkills = HARD_CODED_SKILLS.filter((token) => hasTerm(text, token));
  const foundFrameworks = HARD_CODED_FRAMEWORKS.filter((token) => hasTerm(text, token));
  const foundLanguages = HARD_CODED_LANGUAGES.filter((token) => hasTerm(text, token));
  const foundKeywords = HARD_CODED_KEYWORDS.filter((token) => hasTerm(text, token));

  const found = uniqueNormalized([...foundSkills, ...foundFrameworks, ...foundLanguages, ...foundKeywords]);
  return {
    skills: uniqueNormalized([...foundSkills, ...found]),
    frameworks: uniqueNormalized(foundFrameworks),
    languages: uniqueNormalized(foundLanguages),
    keywords: uniqueNormalized([...foundKeywords, ...found])
  };
};

export const parseJDWithAI = async (jdText) => {
  const input = String(jdText || "").trim();
  if (!input) {
    return { skills: [], frameworks: [], languages: [], keywords: [] };
  }

  const hardcodedParsed = validateParsedJD(parseHardcodedJD(input));
  console.log("JD parser text hardcoded parsed:", JSON.stringify(hardcodedParsed, null, 2));

  const hash = crypto.createHash("sha256").update(input).digest("hex");
  const cacheKey = `jd:parse:${JD_PARSE_SCHEMA_VERSION}:${hash}`;

  const cached = await cacheGet(cacheKey);
  if (cached) {
    const validatedCached = validateParsedJD(cached);
    const mergedCached = mergeParsedJD(validatedCached, hardcodedParsed);
    console.log("JD parser cached AI parsed:", JSON.stringify(validatedCached, null, 2));
    console.log("JD parser final merged parsed:", JSON.stringify(mergedCached, null, 2));
    return mergedCached;
  }

  const parsed = await generateAIJson(buildPrompt(input), { maxOutputTokens: 1200 });
  console.log("JD parser AI raw parsed:", JSON.stringify(parsed, null, 2));
  const validated = validateParsedJD(parsed);
  console.log("JD parser AI validated parsed:", JSON.stringify(validated, null, 2));
  const merged = mergeParsedJD(validated, hardcodedParsed);
  console.log("JD parser final merged parsed:", JSON.stringify(merged, null, 2));

  await cacheSet(cacheKey, validated, JD_PARSE_TTL_SECONDS);
  return merged;
};
