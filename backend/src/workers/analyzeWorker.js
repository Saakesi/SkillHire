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
import { computeBadges } from "../services/badges/badgeService.js";

dotenv.config();
await mongoose.connect(process.env.MONGO_URI);
console.log("🟢 Worker MongoDB connected");

const connection = new IORedis({
  maxRetriesPerRequest: null
});


const worker = new Worker(
  "analyzeProfile",
  async job => {
    console.log(`Job ${job.id} started`);
    const { githubId, githubUsername, githubToken } = job.data;

    try {
      // mark as processing
      await Analysis.findOneAndUpdate(
        { githubId },
        { status: "processing" }
      );

      // Fetch repos
      console.time("fetchUserRepos");
      const repos = await fetchUserRepos(githubToken);
      console.timeEnd("fetchUserRepos");

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


      //further optimisation->parallel metric services
      console.time("parallelMetrics");

      const [
        languageData,
        frameworks,
        activityMetrics,
        collaborationMetrics,
        qualityMetrics
      ] = await Promise.all([
        computeLanguageMetrics(repos, githubToken),
        detectFrameworks(repos, githubToken),
        getActivityMetrics(repos, githubToken, githubUsername),
        getCollaborationMetrics(githubUsername, githubToken),
        getProjectQualityMetrics(repos, githubToken)
      ]);

      console.timeEnd("parallelMetrics");

      const {
        languagePercentages,
        primaryLanguage,
        languageEntropy
      } = languageData;


      // console.time("computeLanguageMetrics");
      // const {
      //   languagePercentages,
      //   primaryLanguage,
      //   languageEntropy
      // } = await computeLanguageMetrics(repos, githubToken);
      // console.timeEnd("computeLanguageMetrics");

      //Stack classification
      console.time("getStack");
      const { developerType, techStack } = getStack(languagePercentages);
      console.timeEnd("getStack");

      //get frameworks
      // console.time("detectFrameworks");
      // const frameworks = await detectFrameworks(repos, githubToken);
      // console.timeEnd("detectFrameworks");

      // activity
      // console.log("Running activity metrics...");
      // console.time("getActivityMetrics");
      // const activityMetrics = await getActivityMetrics(
      //   repos,
      //   githubToken,
      //   githubUsername
      // );
      // console.timeEnd("getActivityMetrics");

      // collaboration
      // console.log("Running collaboration metrics...");
      // console.time("getCollaborationMetrics");
      // const collaborationMetrics = await getCollaborationMetrics(
      //   githubUsername,
      //   githubToken
      // );
      // console.timeEnd("getCollaborationMetrics");

      // project quality
      // console.log("Running project quality metrics...");
      // console.time("getProjectQualityMetrics");
      // const qualityMetrics = await getProjectQualityMetrics(
      //   repos,
      //   githubToken
      // );
      // console.timeEnd("getProjectQualityMetrics");

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

      //get badges
      console.log("Badge calculation started..");
      const badges = computeBadges(rawMetrics);
      console.log("Badge calculation ended..", badges);

      // save final result
      await Analysis.findOneAndUpdate(
        { githubId },
        {
          status: "completed",
          rawMetrics,
          badges,
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
