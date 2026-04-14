import express from "express";
import { analyzeProfile, getAnalyzeStatus } from "../controllers/analyzeController.js";
import Profile from "../models/Profile.js";
import { requireAuth } from "../middleware/auth.js";
import { enqueueAnalysis } from "../jobs/analyzeProfileJob.js";

const router = express.Router();

router.post("/", analyzeProfile); // Queue analysis job
router.get("/status/:username", getAnalyzeStatus); // Check job status

router.post("/trigger", requireAuth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ githubId: req.user.githubId });
    if (!profile) {
      return res.status(404).json({ error: "Profile not found." });
    }

    if (!profile.githubAccessToken) {
      return res.status(400).json({ error: "No GitHub token found. Please log in again." });
    }

    const jobData = {
      githubId:         profile.githubId,
      githubUsername:   profile.username,
      githubToken:      profile.githubAccessToken,
      leetcodeUsername: profile.leetcodeUsername ?? null,
    };

    // enqueueAnalysis handles priority + duplicate detection
    const result = await enqueueAnalysis(profile, jobData);

    if (!result.queued) {
      return res.status(409).json(result);  // 409 = already queued
    }

    res.json(result);

  } catch (err) {
    console.error("Trigger error:", err);
    res.status(500).json({ error: "Failed to queue analysis." });
  }
});

export default router;
