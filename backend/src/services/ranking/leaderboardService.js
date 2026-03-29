import Analysis from "../../models/Analysis.js";

export const getGlobalLeaderboard = async (limit = 100) => {
  return await Analysis.aggregate([
    // 🔥 Step 1: Sort by score
    { $sort: { overallScore: -1 } },

    // 🔥 Step 2: Add rank
    {
      $setWindowFields: {
        sortBy: { overallScore: -1 },
        output: {
          rank: { $rank: {} }
        }
      }
    },

    // 🔥 Step 3: Limit AFTER rank (important)
    { $limit: limit },

    // 🔥 Step 4: Join profile
    {
      $lookup: {
        from: "profiles",
        localField: "githubId",
        foreignField: "githubId",
        as: "profile"
      }
    },

    { $unwind: "$profile" },

    // 🔥 Step 5: Final shape
    {
      $project: {
        githubId: 1,
        overallScore: 1,
        rank: 1,
        username: "$profile.username",
        avatarUrl: "$profile.avatarUrl"
      }
    }
  ]);
};

export const getTop10Leaderboard = async () => {
  return await Analysis.aggregate([
    
    // 🔥 Ensure score exists
    {
      $addFields: {
        gitHireScore: {
          $ifNull: ["$gitHireScore", "$scoreBreakdown.weightedScore"]
        }
      }
    },

    // 🔥 Sort globally
    { $sort: { gitHireScore: -1 } },

    // 🔥 Compute GLOBAL rank
    {
      $setWindowFields: {
        sortBy: { gitHireScore: -1 },
        output: {
          rank: { $denseRank: {} } // or $rank if you want gaps
        }
      }
    },

    // 🔥 NOW take top 10
    { $limit: 10 },

    // 🔥 Join profile
    {
      $lookup: {
        from: "profiles",
        localField: "githubId",
        foreignField: "githubId",
        as: "profile"
      }
    },

    { $unwind: "$profile" },

    // 🔥 Final output
    {
      $project: {
        _id: 0,
        githubId: 1,
        rank: 1,
        username: "$profile.username",
        avatarUrl: "$profile.avatarUrl",
        gitHireScore: 1
      }
    }
  ]);
};