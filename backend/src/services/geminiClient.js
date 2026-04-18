import { GoogleGenerativeAI } from "@google/generative-ai";

let modelInstance = null;
let modelNameInUse = null;

const extractJsonString = (text = "") => {
  const trimmed = String(text).trim();
  if (!trimmed) return "";

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) return fencedMatch[1].trim();

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return trimmed.slice(start, end + 1);
  }

  const arrStart = trimmed.indexOf("[");
  const arrEnd = trimmed.lastIndexOf("]");
  if (arrStart !== -1 && arrEnd !== -1 && arrEnd > arrStart) {
    return trimmed.slice(arrStart, arrEnd + 1);
  }

  return trimmed;
};

const extractBalancedJsonBlock = (text = "") => {
  const input = String(text);
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

const parseGeminiJson = (rawText = "") => {
  const candidates = [];
  const extracted = extractJsonString(rawText);
  if (extracted) candidates.push(extracted);

  const balancedFromExtracted = extractBalancedJsonBlock(extracted);
  if (balancedFromExtracted) candidates.push(balancedFromExtracted);

  const balancedFromRaw = extractBalancedJsonBlock(rawText);
  if (balancedFromRaw) candidates.push(balancedFromRaw);

  for (const candidate of [...new Set(candidates)]) {
    try {
      return JSON.parse(candidate);
    } catch {
      // try next candidate
    }
  }

  throw new Error("Could not parse Gemini JSON response");
};

export const getGeminiModel = () => {
  if (modelInstance) return modelInstance;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("Gemini init skipped: GEMINI_API_KEY is missing");
    return null;
  }

  const modelName = process.env.GEMINI_MODEL || "gemini-flash-latest";

  const genAI = new GoogleGenerativeAI(apiKey);
  modelInstance = genAI.getGenerativeModel({ model: modelName });
  modelNameInUse = modelName;
  console.log(`Gemini client initialized with model: ${modelNameInUse}`);
  return modelInstance;
};

export const generateGeminiJson = async (prompt, { maxOutputTokens = 2048 } = {}) => {
  const model = getGeminiModel();
  if (!model) return null;

  try {
    console.log(`Gemini request started (model=${modelNameInUse || "unknown"})`);
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens,
        responseMimeType: "application/json"
      }
    });

    const text = result?.response?.text?.() || "";
    const parsed = parseGeminiJson(text);
    console.log("Gemini request succeeded and JSON parsed");
    return parsed;
  } catch (err) {
    console.error("Gemini JSON generation failed:", err?.message || err);
    return null;
  }
};

export const generateGeminiText = async (prompt, { maxOutputTokens = 2048 } = {}) => {
  const model = getGeminiModel();
  if (!model) return null;

  try {
    console.log(`Gemini text request started (model=${modelNameInUse || "unknown"})`);
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens
      }
    });

    const text = (result?.response?.text?.() || "").trim();
    if (!text) return null;
    console.log("Gemini text request succeeded");
    return text;
  } catch (err) {
    console.error("Gemini text generation failed:", err?.message || err);
    return null;
  }
};
