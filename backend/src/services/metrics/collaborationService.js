import axios from "axios";

export const getCollaborationMetrics = async (
  githubUsername,
  githubToken
) => {

  console.log("🤝 Fetching collaboration metrics...");

  const headers = {
    Authorization: `Bearer ${githubToken}`
  };

  try {

    const prSearch = await axios.get(
      "https://api.github.com/search/issues",
      {
        headers,
        params: {
          q: `author:${githubUsername} type:pr`,
          per_page: 1
        }
      }
    );

    const mergedPRSearch = await axios.get(
      "https://api.github.com/search/issues",
      {
        headers,
        params: {
          q: `author:${githubUsername} type:pr is:merged`,
          per_page: 1
        }
      }
    );

    const externalPRSearch = await axios.get(
      "https://api.github.com/search/issues",
      {
        headers,
        params: {
          q: `author:${githubUsername} type:pr -user:${githubUsername}`,
          per_page: 1
        }
      }
    );

    const issueSearch = await axios.get(
      "https://api.github.com/search/issues",
      {
        headers,
        params: {
          q: `author:${githubUsername} type:issue`,
          per_page: 1
        }
      }
    );

    console.log("✅ Collaboration metrics fetched");

    return {
      prCount: prSearch.data.total_count,
      mergedPRCount: mergedPRSearch.data.total_count,
      externalPRs: externalPRSearch.data.total_count,
      issueCount: issueSearch.data.total_count
    };

  } catch (err) {

    console.log("⚠️ Collaboration metrics failed");

    return {
      prCount: 0,
      mergedPRCount: 0,
      externalPRs: 0,
      issueCount: 0
    };
  }
};