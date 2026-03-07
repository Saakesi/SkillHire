import axios from "axios";

export const getCollaborationMetrics = async (
  githubUsername,
  githubToken
) => {

  const headers = {
    Authorization: `Bearer ${githubToken}`
  };

  try {

    const queries = [
      `author:${githubUsername} type:pr`,
      `author:${githubUsername} type:pr is:merged`,
      `author:${githubUsername} type:pr -user:${githubUsername}`,
      `author:${githubUsername} type:issue`
    ];

    const requests = queries.map(q =>
      axios.get("https://api.github.com/search/issues", {
        headers,
        params: { q, per_page: 1 }
      })
    );

    const [
      prSearch,
      mergedPRSearch,
      externalPRSearch,
      issueSearch
    ] = await Promise.all(requests);

    return {
      prCount: prSearch.data.total_count,
      mergedPRCount: mergedPRSearch.data.total_count,
      externalPRs: externalPRSearch.data.total_count,
      issueCount: issueSearch.data.total_count
    };

  } catch {

    return {
      prCount: 0,
      mergedPRCount: 0,
      externalPRs: 0,
      issueCount: 0
    };
  }
};