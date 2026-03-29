import axios from "axios";

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

const CODE_REVIEW_QUERY = `
  query($username: String!) {
    user(login: $username) {
      contributionsCollection {
        pullRequestReviewContributions(first: 100) {
          totalCount
          nodes {
            pullRequestReview {
              state
              comments {
                totalCount
              }
            }
          }
        }
      }
    }
  }
`;

async function getCodeReviewMetrics(githubUsername, headers) {
  try {
    const response = await axios.post(
      GITHUB_GRAPHQL_URL,
      { query: CODE_REVIEW_QUERY, variables: { username: githubUsername } },
      { headers }
    );

    const contributions =
      response.data?.data?.user?.contributionsCollection
        ?.pullRequestReviewContributions;

    if (!contributions) return { reviewsGiven: 0, approvals: 0, changesRequested: 0, reviewComments: 0 };

    const reviewsGiven = contributions.totalCount;
    let approvals = 0;
    let changesRequested = 0;
    let reviewComments = 0;

    for (const node of contributions.nodes) {
      const review = node.pullRequestReview;
      if (!review) continue;
      if (review.state === "APPROVED") approvals++;
      else if (review.state === "CHANGES_REQUESTED") changesRequested++;
      reviewComments += review.comments?.totalCount || 0;
    }

    return { reviewsGiven, approvals, changesRequested, reviewComments };
  } catch {
    return { reviewsGiven: 0, approvals: 0, changesRequested: 0, reviewComments: 0 };
  }
}

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
      issueSearch,
      reviewMetrics
    ] = await Promise.all([
      ...requests,
      getCodeReviewMetrics(githubUsername, headers)
    ]);

    return {
      prCount: prSearch.data.total_count,
      mergedPRCount: mergedPRSearch.data.total_count,
      externalPRs: externalPRSearch.data.total_count,
      issueCount: issueSearch.data.total_count,
      ...reviewMetrics
    };

  } catch {

    return {
      prCount: 0,
      mergedPRCount: 0,
      externalPRs: 0,
      issueCount: 0,
      reviewsGiven: 0,
      approvals: 0,
      changesRequested: 0,
      reviewComments: 0
    };
  }
};