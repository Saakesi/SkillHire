
import Profile from "../models/Profile.js";
import jwt from "jsonwebtoken";

import Analysis from "../models/Analysis.js";
import { fetchReposQueue } from "../jobs/fetchReposJob.js";

export const analyzeProfile = async (req, res) => {
  const token = req.cookies.auth;
  if (!token) return res.status(401).json({ error: "Not logged in" });

  let user;
  try {
    user = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }

  const profile = await Profile.findOne({ githubId: user.githubId }).select("+githubAccessToken");
  if (!profile || !profile.githubAccessToken) {
    return res.status(400).json({ error: "GitHub not connected" });
  }

  await Analysis.findOneAndUpdate(
    { githubId: user.githubId },
    { status: "queued", result: null, updatedAt: new Date() },
    { upsert: true }
  );

  await fetchReposQueue.add("fetch-repos", {
    githubId: user.githubId,
    accessToken: profile.githubAccessToken
  });

  res.json({ message: "Profile analysis started" });
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
      result: analysis.result,
      updatedAt: analysis.updatedAt
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
