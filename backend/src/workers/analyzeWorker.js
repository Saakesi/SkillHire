// workers/analyzeWorker.js  (or wherever your worker lives)
import { Worker } from "bullmq";
import IORedis from "ioredis";
import mongoose from "mongoose";
import dotenv from "dotenv";

import Analysis from "../models/Analysis.js";
import Profile from "../models/Profile.js";            // ← ADD THIS

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
import { getCollegeName } from "../seed/collegeNameMap.js";  // ← ADD THIS

dotenv.config();
await mongoose.connect(process.env.MONGO_URI);

console.log("🟢 Worker MongoDB connected");

const connection = new IORedis({ maxRetriesPerRequest: null });

const worker = new Worker(
  "analyzeProfile",
  async job => {
    const startTime = Date.now();
    console.log(`Job ${job.id} started`);
    const { githubId, githubUsername, githubToken, leetcodeUsername } = job.data;

    try {
      console.log(`🚀 Starting analysis for ${githubUsername}`);

      await Analysis.findOneAndUpdate(
        { githubId },
        { status: "processing" }
      );

      const repos = await fetchUserRepos(githubToken);

      const repoCount   = repos.length;
      const totalStars  = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
      const totalForks  = repos.reduce((sum, r) => sum + r.forks_count, 0);

      const [
        languageData,
        frameworks,
        activityMetrics,
        collaborationMetrics,
        qualityMetrics,
        leetcodeMetrics,
        profile                          // ← ADD: fetch profile in parallel
      ] = await Promise.all([
        computeLanguageMetrics(repos, githubToken),
        detectFrameworks(repos, githubToken),
        getActivityMetrics(repos, githubToken, githubUsername),
        getCollaborationMetrics(githubUsername, githubToken),
        getProjectQualityMetrics(repos, githubToken),
        leetcodeUsername ? analyzeLeetcode(leetcodeUsername) : null,
        Profile.findOne({ githubId }).select(  // ← ADD
          "edu_verified collegeDomain edu_confidence"
        )
      ]);

      console.log("QUALITY METRICS RAW:", qualityMetrics);

      const { languagePercentages, primaryLanguage, languageEntropy } = languageData;
      const { developerType, techStack } = getStack(languagePercentages);

      const filteredQualityMetrics = Object.fromEntries(
        Object.entries(qualityMetrics).filter(([_, value]) => value > 0)
      );

      const deploymentMap = {
        vercel: "Vercel", render: "Render", aws: "AWS",
        firebase: "Firebase", netlify: "Netlify", kubernetes: "Kubernetes"
      };
      const deploymentSkills = Object.keys(deploymentMap)
        .filter(key => qualityMetrics[key] > 0)
        .map(key => deploymentMap[key]);

      const languageSkills = Object.keys(languagePercentages);
      const skills = [...languageSkills, ...frameworks, ...deploymentSkills];
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
        qualityIndicators: filteredQualityMetrics,

        // ← ADD: inject edu fields so badgeRules can read them
        edu_verified:   profile?.edu_verified  ?? false,
        collegeDomain:  profile?.collegeDomain ?? null,
        edu_confidence: profile?.edu_confidence ?? null,
      };

      const leetcodeScore = computeLeetCodeScore(leetcodeMetrics);
      console.log("LeetCode Score:", leetcodeScore);

      const scoreData = computeGitHireScore(rawMetrics, leetcodeScore);
      console.log("GitHire Score:", scoreData.finalScore);

      if (leetcodeScore > 0) {
        console.log(`LC contributed ${scoreData.leetcodeContribution} pts`);
      }

      let badges = [];
      try {
        console.log("Computing badges...");
        badges = computeBadges(rawMetrics);
        console.log("Badges calculated:", badges);
      } catch (err) {
        console.error("Badge computation error:", err.message);
      }

      // ← ADD: build the human-readable edu badge label
      const eduBadgeLabel = profile?.edu_verified && profile?.collegeDomain
        ? `${getCollegeName(profile.collegeDomain)} verified`
        : null;

      await Analysis.findOneAndUpdate(
        { githubId },
        {
          githubId,
          username:       githubUsername,
          status:         "completed",
          rawMetrics,
          overallScore:   scoreData.finalScore,
          finalScore:     scoreData.finalScore,
          scoreBreakdown: scoreData,
          leetcodeScore,
          badges,
          eduBadge:       eduBadgeLabel,   // ← ADD: "IIT Bombay verified"
          leetcodeMetrics,
          updatedAt:      new Date()
        }
      );

      await cacheDelPattern("leaderboard:*");

      const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`Worker completed in ${totalTime}s`);

      return { rawMetrics, score: scoreData.finalScore };

    } catch (error) {
      console.error("❌ Analysis failed:", error.message);
      await Analysis.findOneAndUpdate(
        { githubId },
        { status: "failed", error: error.message }
      );
      throw error;
    }
  },
  { connection }
);

worker.on("completed", job => console.log(`✅ Job ${job.id} completed`));
worker.on("failed",    (job, err) => console.error(`❌ Job ${job?.id} failed`, err));
