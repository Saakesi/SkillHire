import axios from "axios";

export const computeLanguageMetrics = async (repos, githubToken) => {
  const languageBytes = {};
  for (const repo of repos) {
    console.log(repo.name);
    try {
      const response = await axios.get(repo.languages_url, {
        headers: { Authorization: `Bearer ${githubToken}` }
      });

      const languages = response.data;

      for (const [lang, bytes] of Object.entries(languages)) {
        languageBytes[lang] = (languageBytes[lang] || 0) + bytes;
      }
    } catch {
      console.log(`Skipping language fetch for ${repo.name}`);
    }
  }

  // If user has no languages
  if (Object.keys(languageBytes).length === 0) {
    console.log("No language data found.");
  }

  const totalBytes = Object.values(languageBytes)
    .reduce((sum, val) => sum + val, 0);

  const languagePercentages = {};
  let primaryLanguage = null;
  let maxBytes = 0;

  if (totalBytes > 0) {
    for (const [lang, bytes] of Object.entries(languageBytes)) {
      const percent = (bytes / totalBytes);
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
    if (p > 0) {
      languageEntropy -= p * Math.log2(p);
    }
  }

  return {
    languagePercentages,
    primaryLanguage,
    languageEntropy,
  };
};