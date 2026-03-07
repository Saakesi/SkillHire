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

import { computeGitHireScore } from "../services/scoring/scoreEngine.js";

dotenv.config();

/* ------------------- MongoDB ------------------- */

console.log("ENV MONGO_URI =", process.env.MONGO_URI);

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

    const { githubId, githubUsername, githubToken } = job.data;

    try {

      console.log(`🚀 Starting analysis for ${githubUsername}`);

      /* -------- mark job processing -------- */

      await Analysis.findOneAndUpdate(
        { githubId },
        { status: "processing" }
      );

      /* -------- Fetch repos -------- */

      const repos = await fetchUserRepos(githubToken);

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

      const {
        languagePercentages,
        primaryLanguage,
        languageEntropy
      } = await computeLanguageMetrics(repos, githubToken);

      /* -------- Stack Classification -------- */

      const { developerType, techStack } =
        getStack(languagePercentages);

      /* -------- Framework Detection -------- */

      const frameworks =
        await detectFrameworks(repos, githubToken);

      /* -------- Activity Metrics -------- */

      console.log("📊 Running activity metrics...");

      const activityMetrics =
        await getActivityMetrics(repos, githubToken);

      /* -------- Collaboration Metrics -------- */

      console.log("🤝 Running collaboration metrics...");

      const collaborationMetrics =
        await getCollaborationMetrics(
          githubUsername,
          githubToken
        );

      /* -------- Project Quality -------- */

      console.log("🧪 Running project quality metrics...");

      const qualityMetrics =
        await getProjectQualityMetrics(
          repos,
          githubToken
        );

      /* -------- Raw Metrics Object -------- */

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
        ...activityMetrics,
        ...collaborationMetrics,
        qualityIndicators: qualityMetrics
      };

      /* -------- Scoring Engine -------- */

      const scoreData = computeGitHireScore(rawMetrics);

      console.log("📈 GitHire Score:", scoreData.finalScore);

      /* -------- Save Result -------- */

      await Analysis.findOneAndUpdate(
        { githubId },
        {
          status: "completed",
          rawMetrics,
          overallScore: scoreData.finalScore,
          scoreBreakdown: scoreData,
          updatedAt: new Date()
        }
      );

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
/*
import { Worker } from "bullmq";
import IORedis from "ioredis";
import axios from "axios";
import Analysis from "../models/Analysis.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fetchUserRepos } from "../services/github/repoService.js";
import { computeLanguageMetrics } from "../services/metrics/languageService.js";
import { getStack } from "../services/metrics/stackService.js";
import { detectFrameworks } from "../services/metrics/frameworkService.js";
import { getActivityMetrics } from "../services/metrics/activityService.js";
import { getCollaborationMetrics } from "../services/metrics/collaborationService.js";
import { getProjectQualityMetrics } from "../services/metrics/projectQualityService.js";
import { computeGitHireScore } from "../services/scoring/scoreEngine.js";

dotenv.config();
console.log("ENV MONGO_URI =", process.env.MONGO_URI);
await mongoose.connect(process.env.MONGO_URI);
console.log("🟢 Worker MongoDB connected");

const connection = new IORedis({
  maxRetriesPerRequest: null
});


const worker = new Worker(
  "analyzeProfile",
  async job => {
    const { githubId, githubUsername, githubToken } = job.data;

    try {
      // mark as processing
      await Analysis.findOneAndUpdate(
        { githubId },
        { status: "processing" }
      );

      // Fetch repos
      const repos = await fetchUserRepos(githubToken);

      //popularity metrics
      const repoCount = repos.length;

      const totalStars = repos.reduce(
        (sum, repo) => sum + repo.stargazers_count,
        0
      );

      const totalForks = repos.reduce(
        (sum, repo) => sum + repo.forks_count,
        0
      )

      const {
        languagePercentages,
        primaryLanguage,
        languageEntropy
      } = await computeLanguageMetrics(repos, githubToken);

      //Stack classification
      const { developerType, techStack } = getStack(languagePercentages);

      //get frameworks
      const frameworks = await detectFrameworks(repos, githubToken);
      // activity
console.log("🚀 Running activity metrics...");
const activityMetrics = await getActivityMetrics(
  repos,
  githubToken
);

// collaboration
console.log("🚀 Running collaboration metrics...");
const collaborationMetrics = await getCollaborationMetrics(
  githubUsername,
  githubToken
);

// project quality
console.log("🚀 Running project quality metrics...");
const qualityMetrics = await getProjectQualityMetrics(
  repos,
  githubToken
);

// Build raw metrics
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
  ...activityMetrics,
  ...collaborationMetrics,
  qualityIndicators: qualityMetrics
};

// ✅ compute score AFTER metrics exist
const scoreData = computeGitHireScore(rawMetrics);

// save final result
await Analysis.findOneAndUpdate(
  { githubId },
  {
    status: "completed",
    rawMetrics,
    score: scoreData.finalScore,
    scoreBreakdown: scoreData,
    updatedAt: new Date()
  }
);
      return rawMetrics;
    } catch (error) {
      console.error("Analysis failed:", error.message);

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

worker.on("completed", job => {
  console.log(`✅ Job ${job.id} completed`);
});

worker.on("failed", job => {
  console.error(`❌ Job ${job.id} failed`);
});
*/