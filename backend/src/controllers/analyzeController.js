// src/controllers/analyzeController.js
import { enqueueAnalysis } from "../jobs/analyzeProfileJob.js";  // ← changed
import Profile from "../models/Profile.js";
import jwt from "jsonwebtoken";
import Analysis from "../models/Analysis.js";
import { getCollegeName } from "../seed/collegeNameMap.js";  // ← added (was missing)

export const analyzeProfile = async (req, res) => {
  const token = req.cookies.auth;
  if (!token) return res.status(401).json({ error: "Not logged in" });

  let user;
  try {
    user = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }

  const profile = await Profile.findOne(
    { githubId: user.githubId }
  ).select("+githubAccessToken");

  if (!profile) {
    return res.status(404).json({ error: "Profile not found" });
  }

  if (!profile.githubAccessToken) {
    return res.status(400).json({ error: "GitHub token missing" });
  }

  // Create or reset analysis state
  await Analysis.findOneAndUpdate(
    { githubId: user.githubId },
    {
      githubId:  user.githubId,
      status:    "queued",
      result:    null,
      updatedAt: new Date()
    },
    { upsert: true, new: true }
  );

  const jobData = {
    githubId:         user.githubId,
    githubUsername:   profile.username,
    githubToken:      profile.githubAccessToken,
    leetcodeUsername: profile.leetcodeUsername ?? null,
  };

  // ← enqueueAnalysis handles priority + duplicate detection
  const result = await enqueueAnalysis(profile, jobData);

  if (!result.queued) {
    return res.status(409).json(result);  // already queued
  }

  res.json({
    message:  "Analysis queued",
    jobId:    result.jobId,
    priority: result.priority,
    label:    result.label,
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
        status:        analysis.status,
        overallScore:  0,
        scoreBreakdown: {},
        rawMetrics:    {},
        updatedAt:     analysis.updatedAt
      });
    }

    const scoreBreakdown = analysis.scoreBreakdown;
    const overallScore   = analysis.overallScore;

    if (!analysis.scoreBreakdown || Object.keys(analysis.scoreBreakdown).length === 0) {
      analysis.scoreBreakdown = scoreBreakdown;
      analysis.overallScore   = overallScore;
      await analysis.save();
    }

    const eduBadge =
      analysis.eduBadge
      ?? (profile.edu_verified && profile.collegeDomain
          ? `${getCollegeName(profile.collegeDomain)} verified`  // ← now works
          : null);

    const resolvedBadges = (analysis.badges || []).map(badge =>
      badge === "edu_verified" && eduBadge ? eduBadge : badge
    );

    return res.json({
      status:          analysis.status,
      overallScore,
      scoreBreakdown,
      rawMetrics:      analysis.rawMetrics,
      badges:          resolvedBadges,
      eduBadge,
      leetcodeScore:   analysis.leetcodeScore,
      leetcodeMetrics: analysis.leetcodeMetrics,
      updatedAt:       analysis.updatedAt
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
