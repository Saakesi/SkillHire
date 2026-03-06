import axios from "axios";
import pMap from "p-map";

export const computeLanguageMetrics = async (repos, githubToken) => {
  const languageBytes = {};

  const results = await pMap(
    repos,
    async (repo) => {
      try {
        const response = await axios.get(repo.languages_url, {
          headers: { Authorization: `Bearer ${githubToken}` }
        });

        return response.data;
      } catch {
        console.log(`Skipping language fetch for ${repo.name}`);
        return null;
      }
    },
    { concurrency: 5 } // prevents rate limit bursts
  );

  for (const languages of results) {
    if (!languages) continue;

    for (const [lang, bytes] of Object.entries(languages)) {
      languageBytes[lang] = (languageBytes[lang] || 0) + bytes;
    }
  }

  if (Object.keys(languageBytes).length === 0) {
    console.log("No language data found.");
  }

  const totalBytes = Object.values(languageBytes).reduce(
    (sum, val) => sum + val,
    0
  );

  const languagePercentages = {};
  let primaryLanguage = null;
  let maxBytes = 0;

  if (totalBytes > 0) {
    for (const [lang, bytes] of Object.entries(languageBytes)) {
      const percent = bytes / totalBytes;
      languagePercentages[lang] = percent;

      if (bytes > maxBytes) {
        maxBytes = bytes;
        primaryLanguage = lang;
      }
    }
  }

  let languageEntropy = 0;

  for (const bytes of Object.values(languageBytes)) {
    const p = bytes / totalBytes;
    if (p > 0) languageEntropy -= p * Math.log2(p);
  }

  return {
    languagePercentages,
    primaryLanguage,
    languageEntropy
  };
};