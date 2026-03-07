import axios from "axios";

export const analyzeLeetcode = async (username) => {
  if (!username) return null;
  const query = `
  query getUserFullProfile($username: String!) {
    matchedUser(username: $username) {

      username

      submitStats {
        acSubmissionNum {
          difficulty
          count
        }
      }

      profile {
        ranking
        reputation
      }

      contestBadge {
        name
      }

      tagProblemCounts {
        advanced {
          tagName
          problemsSolved
        }
        intermediate {
          tagName
          problemsSolved
        }
        fundamental {
          tagName
          problemsSolved
        }
      }

      languageProblemCount {
        languageName
        problemsSolved
      }

    }

    userContestRanking(username: $username) {
      rating
      globalRanking
      attendedContestsCount
    }
  }`;

  try {

    const res = await axios.post(
      "https://leetcode.com/graphql",
      {
        query,
        variables: { username }
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Referer": "https://leetcode.com",
          "User-Agent": "Mozilla/5.0"
        }
      }
    );

    const data = res.data.data;

    if (!data || !data.matchedUser) return null;

    const stats = data.matchedUser.submitStats.acSubmissionNum;

    const easy = stats.find(s => s.difficulty === "Easy")?.count || 0;
    const medium = stats.find(s => s.difficulty === "Medium")?.count || 0;
    const hard = stats.find(s => s.difficulty === "Hard")?.count || 0;
    const total = stats.find(s => s.difficulty === "All")?.count || 0;

    return {

      username,

      solved: {
        total,
        easy,
        medium,
        hard
      },

      ranking: data.matchedUser.profile?.ranking || null,

      reputation: data.matchedUser.profile?.reputation || null,

      contest: {
        rating: data.userContestRanking?.rating || null,
        globalRank: data.userContestRanking?.globalRanking || null,
        contestsAttended: data.userContestRanking?.attendedContestsCount || 0
      },

      languages: data.matchedUser.languageProblemCount || [],

      algorithms: {
        advanced: data.matchedUser.tagProblemCounts?.advanced || [],
        intermediate: data.matchedUser.tagProblemCounts?.intermediate || [],
        fundamental: data.matchedUser.tagProblemCounts?.fundamental || []
      }
    };
  } catch (error) {
    console.error("LeetCode API error:", error.message);
    return null;
  }
};