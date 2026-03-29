import { Worker } from "bullmq";
import IORedis from "ioredis";
import mongoose from "mongoose";
import dotenv from "dotenv";

import Analysis from "../models/Analysis.js";

import { fetchUserRepos } from "../services/github/repoService.js";
import { computeLanguageMetrics } from "../services/metrics/languageService.js";
import { getStack } from "../services/metrics/stackService.js";
import { detectFrameworks } from "../services/metrics/frameworkService.js";
import { getActivityMetrics } from "../services/metrics/activityService.js";
import { getCollaborationMetrics } from "../services/metrics/collaborationService.js";
import { getProjectQualityMetrics } from "../services/metrics/projectQualityService.js";
import { computeBadges } from "../services/badges/badgeService.js";
import { analyzeLeetcode } from "../services/leetcode/leetcodeService.js";

import { computeGitHireScore } from "../services/scoring/scoreEngine.js";
import { computeLeetCodeScore } from "../services/scoring/scoreLeetCode.js";
import { cacheDelPattern } from "../services/cache/cacheService.js";

dotenv.config();
await mongoose.connect(process.env.MONGO_URI);

console.log("🟢 Worker MongoDB connected");

/* ------------------- Redis ------------------- */

const connection = new IORedis({
  maxRetriesPerRequest: null
});

/* ------------------- Worker ------------------- */

const worker = new Worker(
  "analyzeProfile",
  async job => {
    const startTime = Date.now();
    console.log(`Job ${job.id} started`);
    const { githubId, githubUsername, githubToken, leetcodeUsername } = job.data;

    try {

      console.log(`🚀 Starting analysis for ${githubUsername}`);

      /* -------- mark job processing -------- */

      await Analysis.findOneAndUpdate(
        { githubId },
        { status: "processing" }
      );

      // Fetch repos
      // console.time("fetchUserRepos");
      const repos = await fetchUserRepos(githubToken);
      // console.timeEnd("fetchUserRepos");

      const repoCount = repos.length;

      const totalStars = repos.reduce(
        (sum, repo) => sum + repo.stargazers_count,
        0
      );

      const totalForks = repos.reduce(
        (sum, repo) => sum + repo.forks_count,
        0
      );

      /* -------- Language Metrics -------- */


      //further optimisation->parallel metric services
      // console.time("parallelMetrics");

      const [
        languageData,
        frameworks,
        activityMetrics,
        collaborationMetrics,
        qualityMetrics,
        leetcodeMetrics
      ] = await Promise.all([
        computeLanguageMetrics(repos, githubToken),
        detectFrameworks(repos, githubToken),
        getActivityMetrics(repos, githubToken, githubUsername),
        getCollaborationMetrics(githubUsername, githubToken),
        getProjectQualityMetrics(repos, githubToken),
        leetcodeUsername ? analyzeLeetcode(leetcodeUsername) : null
      ]);

      console.log("QUALITY METRICS RAW:", qualityMetrics);

      // console.timeEnd("parallelMetrics");

      const {
        languagePercentages,
        primaryLanguage,
        languageEntropy
      } = languageData;

      //Stack classification
      // console.time("getStack");
      const { developerType, techStack } = getStack(languagePercentages);
      // console.timeEnd("getStack");


      const filteredQualityMetrics = Object.fromEntries(
        Object.entries(qualityMetrics).filter(([_, value]) => value > 0)
      );

      // ---------------- DEPLOYMENT SKILLS ----------------
      const deploymentMap = {
        vercel: "Vercel",
        render: "Render",
        aws: "AWS",
        firebase: "Firebase",
        netlify: "Netlify",
        kubernetes: "Kubernetes"
      };
      const deploymentSkills = Object.keys(deploymentMap)
        .filter(key => qualityMetrics[key] > 0)
        .map(key => deploymentMap[key]);

      // ---------------- LANGUAGE SKILLS ----------------

      const languageSkills = Object.keys(languagePercentages);

      // ---------------- FINAL SEARCHABLE SKILLS ----------------

      const skills = [
        ...languageSkills,
        ...frameworks,
        ...deploymentSkills
      ];
      const uniqueSkills = [...new Set(skills)];

      const rawMetrics = {
        repoCount,
        totalStars,
        totalForks,
        languagePercentages,
        primaryLanguage,
        languageEntropy,
        developerType,
        techStack,
        frameworks,
        skills: uniqueSkills,
        ...activityMetrics,
        ...collaborationMetrics,
        qualityIndicators: filteredQualityMetrics
      };

      /* -------- Scoring Engine -------- */

      // Compute LC score first so it can be blended into overall score
      const leetcodeScore = computeLeetCodeScore(leetcodeMetrics);
      console.log("LeetCode Score:", leetcodeScore);

      const scoreData = computeGitHireScore(rawMetrics, leetcodeScore);
      console.log("GitHire Score:", scoreData.finalScore);
      if (leetcodeScore > 0) {
        console.log(`LC contributed ${scoreData.leetcodeContribution} pts to overall score`);
      }

      /* -------- Save Result -------- */
      let badges = [];
     try {
  console.log("Computing badges...");
  badges = computeBadges(rawMetrics);
  console.log("Badges calculated:", badges);
} catch (err) {
  console.error("Badge computation error:", err.message);
}
      // save final result
      await Analysis.findOneAndUpdate(
        { githubId },
        {
          githubId,
          username: githubUsername,
          status: "completed",
          rawMetrics,
          overallScore: scoreData.finalScore,
          finalScore: scoreData.finalScore,
          scoreBreakdown: scoreData,
          leetcodeScore,
          badges,
          leetcodeMetrics,
          updatedAt: new Date()
        }
      );
      // Invalidate all leaderboard caches — scores changed
      await cacheDelPattern("leaderboard:*");

      const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`Worker completed in ${totalTime}s`);
      return {
        rawMetrics,
        score: scoreData.finalScore
      };

    } catch (error) {

      console.error("❌ Analysis failed:", error.message);

      await Analysis.findOneAndUpdate(
        { githubId },
        {
          status: "failed",
          error: error.message
        }
      );

      throw error;
    }
  },
  { connection }
);

/* ------------------- Worker Events ------------------- */

worker.on("completed", job => {
  console.log(`✅ Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed`, err);
});
