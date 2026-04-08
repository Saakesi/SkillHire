import { analyzeProfileQueue } from "../jobs/analyzeProfileJob.js";
import Profile from "../models/Profile.js";
import jwt from "jsonwebtoken";

import Analysis from "../models/Analysis.js";
import { connection as redis } from "../redisClient.js";

const ANALYZE_COOLDOWN_SECONDS = Number(process.env.ANALYZE_COOLDOWN_SECONDS || 300);
const REQUEST_LOCK_SECONDS = Number(process.env.ANALYZE_REQUEST_LOCK_SECONDS || 20);

export const analyzeProfile = async (req, res) => {
  const token = req.cookies.auth;
  if (!token) return res.status(401).json({ error: "Not logged in" });

  let user;
  try {
    user = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }

  // get profile from github token
  const profile = await Profile.findOne(
    { githubId: user.githubId }
  ).select("+githubAccessToken");

  if (!profile) {
    return res.status(404).json({ error: "Profile not found" });
  }

  if (!profile.githubAccessToken) {
    return res.status(400).json({ error: "GitHub token missing" });
  }

  const existing = await Analysis.findOne({ githubId: user.githubId })
    .select("status updatedAt");

  if (existing && ["queued", "processing"].includes(existing.status)) {
    const retryAfterSeconds = 30;
    res.set("Retry-After", String(retryAfterSeconds));
    return res.status(429).json({
      error: "Analysis is already in progress. Please wait for it to finish.",
      status: existing.status,
      retryAfterSeconds
    });
  }

  if (existing?.updatedAt) {
    const nextAllowedAt = new Date(existing.updatedAt).getTime() + (ANALYZE_COOLDOWN_SECONDS * 1000);
    const now = Date.now();
    if (now < nextAllowedAt) {
      const retryAfterSeconds = Math.ceil((nextAllowedAt - now) / 1000);
      res.set("Retry-After", String(retryAfterSeconds));
      return res.status(429).json({
        error: `Please wait before requesting another analysis.`,
        retryAfterSeconds,
        cooldownSeconds: ANALYZE_COOLDOWN_SECONDS
      });
    }
  }

  const lockKey = `analyze:lock:${user.githubId}`;
  const lockAcquired = await redis.set(lockKey, "1", "EX", REQUEST_LOCK_SECONDS, "NX");
  if (!lockAcquired) {
    const retryAfterSeconds = 10;
    res.set("Retry-After", String(retryAfterSeconds));
    return res.status(429).json({
      error: "Analysis request already received. Please wait a few seconds.",
      retryAfterSeconds
    });
  }

  try {
    // create or reset analysis state
    await Analysis.findOneAndUpdate(
      { githubId: user.githubId },
      {
        githubId: user.githubId,
        status: "queued",
        result: null,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    const job = await analyzeProfileQueue.add(
      "analyze",
      {
        githubId: user.githubId,
        githubUsername: profile.username,
        githubToken: profile.githubAccessToken,
        leetcodeUsername: profile.leetcodeUsername
      },
      {
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 }
      }
    );

    return res.json({
      message: "Analysis queued",
      jobId: job.id
    });
  } catch (err) {
    console.error("Failed to enqueue analysis:", err);
    return res.status(500).json({ error: "Failed to queue analysis" });
  } finally {
    await redis.del(lockKey);
  }
};

export const getAnalyzeStatus = async (req, res) => {
  try {
    const { username } = req.params;

    const profile = await Profile.findOne({ username });
    if (!profile) return res.status(404).json({ error: "Profile not found" });

    const analysis = await Analysis.findOne({ githubId: profile.githubId });
    if (!analysis) return res.json({ status: "not started" });

    if (!analysis.rawMetrics || Object.keys(analysis.rawMetrics).length === 0) {
      return res.json({
        status: analysis.status,
        overallScore: 0,
        scoreBreakdown: {},
        rawMetrics: {},
        updatedAt: analysis.updatedAt
      });
    }

    const scoreBreakdown = analysis.scoreBreakdown;
    const overallScore = analysis.overallScore;

    // Optional: save computed breakdown back to DB
    if (!analysis.scoreBreakdown || Object.keys(analysis.scoreBreakdown).length === 0) {
      analysis.scoreBreakdown = scoreBreakdown;
      analysis.overallScore = overallScore;
      await analysis.save();
    }

     const eduBadge =
      analysis.eduBadge
      ?? (profile.edu_verified && profile.collegeDomain
          ? `${getCollegeName(profile.collegeDomain)} verified`
          : null);

    // Replace raw "edu_verified" string with human-readable college name
    const resolvedBadges = (analysis.badges || []).map(badge =>
      badge === "edu_verified" && eduBadge
        ? eduBadge                       // "IIT Bombay verified"
        : badge                          // "polyglot" etc unchanged
    );

    return res.json({
      status: analysis.status,
      overallScore,
      scoreBreakdown,
      rawMetrics: analysis.rawMetrics,
      badges:resolvedBadges,   
      eduBadge,
      leetcodeScore: analysis.leetcodeScore,
      leetcodeMetrics: analysis.leetcodeMetrics,
      updatedAt: analysis.updatedAt
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
