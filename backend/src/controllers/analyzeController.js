import { analyzeProfileQueue } from "../jobs/analyzeProfileJob.js";
import Profile from "../models/Profile.js";
import jwt from "jsonwebtoken";

import Analysis from "../models/Analysis.js";
import { computeGitHireScore } from "../services/scoring/scoreEngine.js";

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

  res.json({
    message: "Analysis queued",
    jobId: job.id
  });
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

    return res.json({
      status: analysis.status,
      overallScore,
      scoreBreakdown,
      rawMetrics: analysis.rawMetrics,
      badges: analysis.badges,
      leetcodeMetrics: analysis.leetcodeMetrics,
      updatedAt: analysis.updatedAt
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
