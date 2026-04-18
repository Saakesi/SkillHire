import axios from "axios";

const GROQ_API_BASE = "https://api.groq.com/openai/v1";
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

const parseAIJson = (rawText = "") => {
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

  throw new Error("Could not parse AI JSON response");
};

export const getAIModel = () => {
  const apiKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("AI client init skipped: GROQ_API_KEY is missing");
    return null;
  }

  const modelName = process.env.GROQ_MODEL || process.env.GEMINI_MODEL || "llama-3.1-8b-instant";
  modelNameInUse = modelName;
  return {
    apiKey,
    modelName
  };
};

export const listAvailableModels = async () => {
  const modelConfig = getAIModel();
  if (!modelConfig) return [];

  try {
    const result = await axios.get(`${GROQ_API_BASE}/models`, {
      headers: {
        Authorization: `Bearer ${modelConfig.apiKey}`
      },
      timeout: 30000
    });

    const models = Array.isArray(result?.data?.data) ? result.data.data : [];
    return models.map((model) => model?.id).filter(Boolean);
  } catch (err) {
    console.error("AI client list models failed:", err?.response?.data || err?.message || err);
    return [];
  }
};

const requestAIText = async (
  prompt,
  { maxOutputTokens = 2048, temperature = 0.3, jsonMode = false, systemPrompt = "" } = {}
) => {
  const modelConfig = getAIModel();
  if (!modelConfig) return null;

  const messages = [];
  if (systemPrompt) {
    messages.push({ role: "system", content: String(systemPrompt) });
  }
  messages.push({ role: "user", content: String(prompt || "") });

  const payload = {
    model: modelConfig.modelName,
    messages,
    max_tokens: maxOutputTokens,
    temperature
  };

  if (jsonMode) {
    payload.response_format = { type: "json_object" };
  }

  const result = await axios.post(`${GROQ_API_BASE}/chat/completions`, payload, {
    headers: {
      Authorization: `Bearer ${modelConfig.apiKey}`,
      "Content-Type": "application/json"
    },
    timeout: 45000
  });

  const content = result?.data?.choices?.[0]?.message?.content;
  if (typeof content === "string") return content.trim();

  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part?.text === "string" ? part.text : ""))
      .join("\n")
      .trim();
  }

  return "";
};

export const generateAIJson = async (prompt, { maxOutputTokens = 2048 } = {}) => {
  const model = getAIModel();
  if (!model) return null;

  try {
    console.log(`AI JSON request started (model=${modelNameInUse || "unknown"})`);
    const text = await requestAIText(prompt, {
      maxOutputTokens,
      temperature: 0.1,
      jsonMode: true,
      systemPrompt: "Return only valid JSON. Do not wrap the response in markdown, headings, or commentary."
    });

    const parsed = parseAIJson(text || "");
    console.log("AI JSON request succeeded and parsed");
    return parsed;
  } catch (err) {
    console.error("AI JSON generation failed:", err?.response?.data || err?.message || err);
    return null;
  }
};

export const generateAIText = async (prompt, { maxOutputTokens = 2048 } = {}) => {
  const model = getAIModel();
  if (!model) return null;

  try {
    console.log(`AI text request started (model=${modelNameInUse || "unknown"})`);
    const text = await requestAIText(prompt, {
      maxOutputTokens,
      temperature: 0.3,
      jsonMode: false,
      systemPrompt: "Return only the requested rows. Do not add titles, markdown, code fences, bullets, or commentary unless explicitly requested."
    });

    if (!text) return null;
    console.log("AI text request succeeded");
    return text;
  } catch (err) {
    console.error("AI text generation failed:", err?.response?.data || err?.message || err);
    return null;
  }
};
