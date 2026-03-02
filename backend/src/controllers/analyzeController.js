import { analyzeProfileQueue } from "../jobs/analyzeProfileJob.js";
import Profile from "../models/Profile.js";
import jwt from "jsonwebtoken";

import Analysis from "../models/Analysis.js";

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
      githubToken: profile.githubAccessToken
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

    // 1️⃣ find profile
    const profile = await Profile.findOne({ username });
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // 2️⃣ find analysis by githubId
    const analysis = await Analysis.findOne({
      githubId: profile.githubId
    });

    if (!analysis) {
      return res.json({ status: "not started" });
    }

    return res.json({
      status: analysis.status,   // queued | processing | completed | failed
      rawMetrics: analysis.rawMetrics,
      updatedAt: analysis.updatedAt
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
