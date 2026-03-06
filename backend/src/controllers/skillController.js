import Skill from "../models/Skill.js";
import Profile from "../models/Profile.js";
//import { getUserFromCookie } from "../utils/getUserFromCookie.js";
import axios from "axios";

import { getActivityMetrics } from "../services/github/activitymetrics.js";

export const fetchGithubMetrics = async (req, res) => {
  try {
    const githubToken = req.body.githubAccessToken;

    if (!githubToken) {
      return res.status(400).json({ error: "Access token required" });
    }

    // Get authenticated user
    const userRes = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${githubToken}` }
    });

    const githubUsername = userRes.data.login;

    // Get repos
    const reposRes = await axios.get("https://api.github.com/user/repos", {
      headers: { Authorization: `Bearer ${githubToken}` }
    });

    const repos = reposRes.data;
    const repoCount = repos.length;

    const sinceDate = new Date();
    sinceDate.setMonth(sinceDate.getMonth() - 6);

    let commitCount6Months = 0;

    const activeWeeksSet = new Set();
    const activeDaysSet = new Set();

    let currentStreak = 0;
    let longestStreak = 0;

    let totalStars = 0;
    let totalForks = 0;

    // ⭐ Project Quality Indicators
    const qualityIndicators = {
      readme: 0,
      ci: 0,
      tests: 0,
      docker: 0,
      license: 0
    };

    for (const repo of repos) {

      totalStars += repo.stargazers_count;
      totalForks += repo.forks_count;

      // ===== Project Quality Check =====
      try {
        const contentsRes = await axios.get(
          `https://api.github.com/repos/${repo.owner.login}/${repo.name}/contents`,
          {
            headers: { Authorization: `Bearer ${githubToken}` }
          }
        );

        const files = contentsRes.data.map(f => f.name.toLowerCase());

        if (files.some(f => f.startsWith("readme"))) {
          qualityIndicators.readme++;
        }

        if (files.includes("dockerfile")) {
          qualityIndicators.docker++;
        }

        if (files.some(f => f.includes("license"))) {
          qualityIndicators.license++;
        }

        if (
          files.includes(".github") ||
          files.includes(".gitlab-ci.yml") ||
          files.includes("circle.yml")
        ) {
          qualityIndicators.ci++;
        }

        if (
          files.includes("test") ||
          files.includes("tests") ||
          files.includes("__tests__")
        ) {
          qualityIndicators.tests++;
        }

      } catch (err) {
        // Some repos may block content access
      }

      // ===== Commit Metrics =====

      let page = 1;

      while (true) {
        const commitRes = await axios.get(
          `https://api.github.com/repos/${repo.owner.login}/${repo.name}/commits`,
          {
            headers: { Authorization: `Bearer ${githubToken}` },
            params: {
              since: sinceDate.toISOString(),
              per_page: 100,
              page
            }
          }
        );

        if (commitRes.data.length === 0) break;

        for (const commit of commitRes.data) {

          const date = new Date(commit.commit.author.date);

          commitCount6Months++;

          const yearWeek = `${date.getFullYear()}-${Math.ceil(
            (date - new Date(date.getFullYear(), 0, 1)) / 604800000
          )}`;

          activeWeeksSet.add(yearWeek);

          const day = date.toISOString().split("T")[0];
          activeDaysSet.add(day);
        }

        page++;
      }
    }

    // ===== Contribution Streak =====

    const sortedDays = Array.from(activeDaysSet).sort(
      (a, b) => new Date(a) - new Date(b)
    );

    let prevDate = null;

    for (const day of sortedDays) {

      const currentDate = new Date(day);

      if (!prevDate) {
        currentStreak = 1;
      } else {

        const diff =
          (currentDate - prevDate) / (1000 * 60 * 60 * 24);

        if (diff === 1) {
          currentStreak++;
        } else {
          currentStreak = 1;
        }
      }

      longestStreak = Math.max(longestStreak, currentStreak);
      prevDate = currentDate;
    }

    // ===== Collaboration Metrics =====

    const prSearch = await axios.get(
      "https://api.github.com/search/issues",
      {
        headers: { Authorization: `Bearer ${githubToken}` },
        params: {
          q: `author:${githubUsername} type:pr`,
          per_page: 1
        }
      }
    );

    const prCount = prSearch.data.total_count;

    const mergedPRSearch = await axios.get(
      "https://api.github.com/search/issues",
      {
        headers: { Authorization: `Bearer ${githubToken}` },
        params: {
          q: `author:${githubUsername} type:pr is:merged`,
          per_page: 1
        }
      }
    );

    const mergedPRCount = mergedPRSearch.data.total_count;

    const externalPRSearch = await axios.get(
      "https://api.github.com/search/issues",
      {
        headers: { Authorization: `Bearer ${githubToken}` },
        params: {
          q: `author:${githubUsername} type:pr -user:${githubUsername}`,
          per_page: 1
        }
      }
    );

    const externalPRs = externalPRSearch.data.total_count;

    const issueSearch = await axios.get(
      "https://api.github.com/search/issues",
      {
        headers: { Authorization: `Bearer ${githubToken}` },
        params: {
          q: `author:${githubUsername} type:issue`,
          per_page: 1
        }
      }
    );

    const issueCount = issueSearch.data.total_count;

    // ===== Final Metrics =====

    const rawMetrics = {
      repoCount,
      totalStars,
      totalForks,

      commitCount6Months,
      activeWeeks: activeWeeksSet.size,
      longestStreak,

      prCount,
      mergedPRCount,
      externalPRs,
      issueCount,

      qualityIndicators
    };

    res.json(rawMetrics);

  } catch (error) {

    console.error(error.response?.data || error.message);

    res.status(500).json({
      error: "Failed to fetch metrics"
    });
  }
};
// GET all skills for a user
export const getSkills = async (req, res) => {
  const { username } = req.params;
  try {
    const profile = await Profile.findOne({ username });
    if (!profile) return res.status(404).json({ error: "Profile not found" });

    const skills = await Skill.find({ profileId: profile._id });
    res.json({ skills, overallScore: skills.reduce((sum, s) => sum + s.score, 0) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Update / add skill manually
export const updateSkill = async (req, res) => {
  const user = getUserFromCookie(req);
  if (!user) return res.status(401).json({ error: "Not logged in" });

  const { name, confidence, score } = req.body;

  try {
    let skill = await Skill.findOne({ profileId: user._id, name });
    if (!skill) {
      skill = await Skill.create({ profileId: user._id, name, confidence, score });
    } else {
      skill.confidence = confidence ?? skill.confidence;
      skill.score = score ?? skill.score;
      skill.updatedAt = new Date();
      await skill.save();
    }

    res.json(skill);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
