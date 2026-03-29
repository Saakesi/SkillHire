import {
  getGlobalLeaderboard,
  getTop10Leaderboard
} from "../services/ranking/leaderboardService.js";

import Profile from "../models/Profile.js";
import Analysis from "../models/Analysis.js";
import { cacheGet, cacheSet } from "../services/cache/cacheService.js";

const CATEGORY_TTL = 600; // 10 minutes

/* -------- Global Leaderboard -------- */
export const leaderboard = async (req, res) => {
  res.json(await getGlobalLeaderboard());
};
/*

export const weeklyTop = async (req, res) => {
  res.json(await getWeeklyTop());
};
*/


export const debugProfiles = async (req, res) => {
  const all = await Profile.find({}, { username: 1, githubId: 1 });
  res.json(all);
};


export const getUserRank = async (req, res) => {
  try {
    const { username } = req.params;

    const profile = await Profile.findOne({ username });
    if (!profile) return res.status(404).json({ error: "User not found" });

    const githubId = Number(profile.githubId);

    const result = await Analysis.aggregate([
      { $sort: { overallScore: -1 } },

      {
        $setWindowFields: {
          sortBy: { overallScore: -1 },
          output: {
            rank: { $rank: {} }
          }
        }
      },

      {
        $match: { githubId: githubId }
      },

      {
        $project: {
          githubId: 1,
          overallScore: 1,
          rank: 1
        }
      }
    ]);

    if (!result.length) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    return res.json({
      ...result[0],
      username: profile.username,
      avatarUrl: profile.avatarUrl,
      name: profile.name
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getTop10 = async (req, res) => {
  try {
    const leaderboard = await getTop10Leaderboard();
    res.json(leaderboard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
};

export const getCategoryRank = async (req, res) => {
  try {
    const { username } = req.params;

    const profile = await Profile.findOne({ username });
    if (!profile) return res.status(404).json({ error: "User not found" });

    const githubId = Number(profile.githubId);

    const analysis = await Analysis.findOne({ githubId });
    if (!analysis) return res.status(404).json({ error: "Analysis not found" });

    const { normalizedScores, weightedScore } = analysis.scoreBreakdown;
    const { frameworks, techStack, developerType, externalPRs, prCount } = analysis.rawMetrics;

    // --- Category Score Calculation ---
    const categories = {};

    // Frontend: React/Vue/Angular frameworks + language diversity
    const frontendFrameworks = ["React", "Vue", "Angular", "Next.js", "Svelte"];
    const hasFrontend = developerType === "Frontend" || developerType === "Full Stack" ||
      frameworks?.some(f => frontendFrameworks.includes(f));
    if (hasFrontend) {
      categories.frontend = (
        (normalizedScores.frameworkScore * 0.4) +
        (normalizedScores.languageDiversityScore * 0.3) +
        (normalizedScores.projectQualityScore * 0.3)
      );
    }

    // Backend: developerType or backend frameworks
    const backendFrameworks = ["Express", "Django", "FastAPI", "Spring", "NestJS", "Node.js"];
    const hasBackend = developerType === "Backend" || developerType === "Full Stack" ||
      frameworks?.some(f => backendFrameworks.includes(f));
    if (hasBackend) {
      categories.backend = (
        (normalizedScores.repoScore * 0.3) +
        (normalizedScores.activityScore * 0.3) +
        (normalizedScores.projectQualityScore * 0.2) +
        (normalizedScores.consistencyScore * 0.2)
      );
    }

    // Full Stack: both frontend + backend signals
    if (hasFrontend && hasBackend) {
      categories.fullStack = (
        (normalizedScores.frameworkScore * 0.25) +
        (normalizedScores.repoScore * 0.25) +
        (normalizedScores.languageDiversityScore * 0.25) +
        (normalizedScores.projectQualityScore * 0.25)
      );
    }

    // Open Source: PRs, forks, collaboration
    const openSourceScore = (
      (normalizedScores.collaborationScore * 0.4) +
      (normalizedScores.forkScore * 0.3) +
      ((externalPRs > 0 ? Math.min(externalPRs * 10, 100) : 0) * 0.3)
    );
    if (prCount > 0 || externalPRs > 0) {
      categories.openSource = openSourceScore;
    }

    // Algorithms/DSA: use the pre-computed leetcodeScore directly (it already
    // accounts for solved count, hard, medium, contest rating, participation, diversity)
    const leetcodeMetrics = analysis.leetcodeMetrics;
    const totalSolved = leetcodeMetrics?.solved?.total || 0;
    if (totalSolved > 0) {
      categories.algorithms = analysis.leetcodeScore || 0;
    }

    // Determine primary category
    const primaryCategory = Object.keys(categories).length
      ? Object.entries(categories).sort((a, b) => b[1] - a[1])[0][0]
      : developerType?.toLowerCase() || "general";

    return res.json({
      username,
      primaryCategory,
      categories,
      overallScore: analysis.overallScore
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};


// ─── shared helper (not exported) ───────────────────────────────────────────
const computeCategoryLeaderboard = async (category) => {

  // Check cache first
  const cacheKey = `leaderboard:${category}`;
  const cached = await cacheGet(cacheKey);
  if (cached) {
    // console.log(`Cache HIT: ${cacheKey}`);
    return cached;
  }
  // console.log(`Cache MISS: ${cacheKey} — querying DB`);

  const frontendFrameworks = ["React", "Vue", "Angular", "Next.js", "Svelte"];
  const backendFrameworks = ["Express", "Django", "FastAPI", "Spring", "NestJS", "Node.js"];

  // Single query: all completed analyses + profiles in one $lookup (fixes N+1)
  const allAnalysis = await Analysis.aggregate([
    { $match: { status: "completed" } },
    {
      $lookup: {
        from: "profiles",
        localField: "githubId",
        foreignField: "githubId",
        as: "profile"
      }
    },
    { $unwind: { path: "$profile", preserveNullAndEmptyArrays: true } }
  ]);

  const scored = [];

  for (const analysis of allAnalysis) {
    const { normalizedScores } = analysis.scoreBreakdown || {};
    if (!normalizedScores) continue;

    const { frameworks, developerType, externalPRs, prCount } = analysis.rawMetrics || {};

    const hasFrontend = developerType === "Frontend" || developerType === "Full Stack" ||
      frameworks?.some(f => frontendFrameworks.includes(f));
    const hasBackend = developerType === "Backend" || developerType === "Full Stack" ||
      frameworks?.some(f => backendFrameworks.includes(f));

    let score = null;

    if (category === "frontend" && hasFrontend) {
      score = (
        (normalizedScores.frameworkScore * 0.4) +
        (normalizedScores.languageDiversityScore * 0.3) +
        (normalizedScores.projectQualityScore * 0.3)
      );
    } else if (category === "backend" && hasBackend) {
      score = (
        (normalizedScores.repoScore * 0.3) +
        (normalizedScores.activityScore * 0.3) +
        (normalizedScores.projectQualityScore * 0.2) +
        (normalizedScores.consistencyScore * 0.2)
      );
    } else if (category === "fullStack" && hasFrontend && hasBackend) {
      score = (
        (normalizedScores.frameworkScore * 0.25) +
        (normalizedScores.repoScore * 0.25) +
        (normalizedScores.languageDiversityScore * 0.25) +
        (normalizedScores.projectQualityScore * 0.25)
      );
    } else if (category === "openSource" && (prCount > 0 || externalPRs > 0)) {
      score = (
        (normalizedScores.collaborationScore * 0.4) +
        (normalizedScores.forkScore * 0.3) +
        ((externalPRs > 0 ? Math.min(externalPRs * 10, 100) : 0) * 0.3)
      );
    } else if (category === "algorithms") {
      const lc = analysis.leetcodeMetrics;
      const totalSolved = lc?.solved?.total || 0;
      if (totalSolved > 0) {
        score = analysis.leetcodeScore || 0;
      }
    }

    if (score !== null) {
      scored.push({
        githubId: analysis.githubId,
        username: analysis.profile?.username || "unknown",
        avatarUrl: analysis.profile?.avatarUrl || "",
        categoryScore: parseFloat(score.toFixed(2)),
        overallScore: analysis.overallScore
      });
    }
  }

  scored.sort((a, b) => b.categoryScore - a.categoryScore);
  const result = scored.map((user, index) => ({ rank: index + 1, ...user }));

  // Only cache non-empty results — empty arrays should not be persisted
  // so re-analyzed users appear immediately on next request
  if (result.length > 0) {
    await cacheSet(cacheKey, result, CATEGORY_TTL);
  }
  return result;
};

// ─── get full leaderboard for a category ─────────────────────────────────────
export const getCategoryLeaderboard = async (req, res) => {
  try {
    const { category } = req.params;
    const ranked = await computeCategoryLeaderboard(category);

    return res.json({
      category,
      totalUsers: ranked.length,
      leaderboard: ranked
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// ─── filtered leaderboard (college / batch / branch) ─────────────────────────
export const getFilteredLeaderboard = async (req, res) => {
  try {
    const { college, batch, branch, category = "global" } = req.query;

    if (!college && !batch && !branch) {
      return res.status(400).json({ error: "At least one filter (college, batch, branch) is required" });
    }

    // Build profile match from filters
    const profileMatch = {};
    if (college)  profileMatch["profile.college.name"] = { $regex: college, $options: "i" };
    if (branch)   profileMatch["profile.branch"]        = { $regex: branch,  $options: "i" };
    if (batch)    profileMatch["profile.graduationYear"] = Number(batch);

    const frontendFrameworks = ["React", "Vue", "Angular", "Next.js", "Svelte"];
    const backendFrameworks  = ["Express", "Django", "FastAPI", "Spring", "NestJS", "Node.js"];

    const pipeline = [
      { $match: { status: "completed" } },
      {
        $lookup: {
          from: "profiles",
          localField: "githubId",
          foreignField: "githubId",
          as: "profile"
        }
      },
      { $unwind: { path: "$profile", preserveNullAndEmptyArrays: false } },
      { $match: profileMatch },
    ];

    const allAnalysis = await Analysis.aggregate(pipeline);

    // Score each by category (reuse same logic as computeCategoryLeaderboard)
    const scored = [];

    for (const analysis of allAnalysis) {
      const { normalizedScores } = analysis.scoreBreakdown || {};
      if (!normalizedScores) continue;

      const { frameworks, developerType, externalPRs, prCount } = analysis.rawMetrics || {};
      const hasFrontend = developerType === "Frontend" || developerType === "Full Stack" ||
        frameworks?.some(f => frontendFrameworks.includes(f));
      const hasBackend = developerType === "Backend" || developerType === "Full Stack" ||
        frameworks?.some(f => backendFrameworks.includes(f));

      let score = null;

      if (category === "global") {
        score = analysis.overallScore ?? 0;
      } else if (category === "frontend" && hasFrontend) {
        score = (normalizedScores.frameworkScore * 0.4) +
                (normalizedScores.languageDiversityScore * 0.3) +
                (normalizedScores.projectQualityScore * 0.3);
      } else if (category === "backend" && hasBackend) {
        score = (normalizedScores.repoScore * 0.3) +
                (normalizedScores.activityScore * 0.3) +
                (normalizedScores.projectQualityScore * 0.2) +
                (normalizedScores.consistencyScore * 0.2);
      } else if (category === "fullStack" && hasFrontend && hasBackend) {
        score = (normalizedScores.frameworkScore * 0.25) +
                (normalizedScores.repoScore * 0.25) +
                (normalizedScores.languageDiversityScore * 0.25) +
                (normalizedScores.projectQualityScore * 0.25);
      } else if (category === "openSource" && (prCount > 0 || externalPRs > 0)) {
        score = (normalizedScores.collaborationScore * 0.4) +
                (normalizedScores.forkScore * 0.3) +
                ((externalPRs > 0 ? Math.min(externalPRs * 10, 100) : 0) * 0.3);
      } else if (category === "algorithms") {
        const totalSolved = analysis.leetcodeMetrics?.solved?.total || 0;
        if (totalSolved > 0) score = analysis.leetcodeScore || 0;
      }

      if (score !== null) {
        scored.push({
          githubId:      analysis.githubId,
          username:      analysis.profile?.username  || "unknown",
          avatarUrl:     analysis.profile?.avatarUrl || "",
          college:       analysis.profile?.college?.name || null,
          branch:        analysis.profile?.branch || null,
          graduationYear: analysis.profile?.graduationYear || null,
          categoryScore: category === "global" ? score : parseFloat(score.toFixed(2)),
          overallScore:  analysis.overallScore
        });
      }
    }

    scored.sort((a, b) => {
      const key = category === "global" ? "overallScore" : "categoryScore";
      return b[key] - a[key];
    });

    const result = scored.map((u, i) => ({ rank: i + 1, ...u }));

    return res.json({
      category,
      filters: { college: college || null, batch: batch ? Number(batch) : null, branch: branch || null },
      totalUsers: result.length,
      leaderboard: result
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// ─── get distinct filter options (colleges, branches, batches) ─────────────────
export const getFilterOptions = async (req, res) => {
  try {
    const profiles = await Profile.find(
      { $or: [{ "college.name": { $exists: true, $ne: null } }, { branch: { $exists: true, $ne: null } }, { graduationYear: { $exists: true, $ne: null } }] },
      { "college.name": 1, branch: 1, graduationYear: 1 }
    ).lean();

    const colleges     = [...new Set(profiles.map(p => p.college?.name).filter(Boolean))].sort();
    const branches     = [...new Set(profiles.map(p => p.branch).filter(Boolean))].sort();
    const batches      = [...new Set(profiles.map(p => p.graduationYear).filter(Boolean))].sort((a, b) => b - a);

    return res.json({ colleges, branches, batches });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// ─── get a specific user's rank in a category ─────────────────────────────────
export const getUserCategoryRank = async (req, res) => {
  try {
    const { category, username } = req.params;
    const ranked = await computeCategoryLeaderboard(category);

    const userEntry = ranked.find(u => u.username === username);
    if (!userEntry) {
      return res.status(404).json({ error: `User not found in ${category} category` });
    }

    return res.json({ category, ...userEntry });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};