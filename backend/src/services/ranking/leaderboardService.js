import Analysis from "../../models/Analysis.js";
import { cacheGet, cacheSet } from "../cache/cacheService.js";

const LEADERBOARD_TTL = 600; // 10 minutes

export const getGlobalLeaderboard = async (limit = 100) => {
  const key = `leaderboard:global`;
  const cached = await cacheGet(key);
  if (cached) {
    console.log("Cache HIT: leaderboard:global");
    return cached;
  }
  console.log("Cache MISS: leaderboard:global — querying DB");
  const result = await Analysis.aggregate([
    // Step 1: Sort by score
    { $sort: { overallScore: -1 } },

    // Step 2: Add rank
    {
      $setWindowFields: {
        sortBy: { overallScore: -1 },
        output: {
          rank: { $rank: {} }
        }
      }
    },

    // Step 3: Limit AFTER rank (important)
    { $limit: limit },

    // Step 4: Join profile
    {
      $lookup: {
        from: "profiles",
        localField: "githubId",
        foreignField: "githubId",
        as: "profile"
      }
    },

    { $unwind: "$profile" },

    // Step 5: Final shape
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
  if (result.length > 0) {
    await cacheSet(key, result, LEADERBOARD_TTL);
  }
  return result;
};

export const getTop10Leaderboard = async () => {
  return await Analysis.aggregate([
    
    // Ensure score exists
    {
      $addFields: {
        gitHireScore: {
          $ifNull: ["$gitHireScore", "$scoreBreakdown.weightedScore"]
        }
      }
    },

    // Sort globally
    { $sort: { gitHireScore: -1 } },

    // Compute GLOBAL rank
    {
      $setWindowFields: {
        sortBy: { gitHireScore: -1 },
        output: {
          rank: { $denseRank: {} } // or $rank if you want gaps
        }
      }
    },

    // NOW take top 10
    { $limit: 10 },

    // Join profile
    {
      $lookup: {
        from: "profiles",
        localField: "githubId",
        foreignField: "githubId",
        as: "profile"
      }
    },

    { $unwind: "$profile" },

    // Final output
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