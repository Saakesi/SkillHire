// routes/studentCollegeVerify.js
console.log("studentCollegeVerify file loaded");
import express from "express";
import crypto  from "crypto";

// Reuse your existing mailer — no new mailer file needed
import { sendOTPEmail } from "../services/email/emailService.js";

import { validateCollegeEmail } from "../seed/collegeEmailValidator.js";
import StudentCollegeVerification from "../models/StudentCollegeVerification.js";
import Profile from "../models/Profile.js";

import { requireAuth } from "../middleware/auth.js";  // ← now works

const router = express.Router();

// ─────────────────────────────────────────────
// POST /api/student/college-verify/send-otp
// ─────────────────────────────────────────────
router.post("/send-otp", requireAuth, async (req, res) => {
  try {
    const { collegeEmail } = req.body;
    if (!collegeEmail) {
      return res.status(400).json({ error: "College email is required" });
    }

    const check = validateCollegeEmail(collegeEmail);
    if (!check.valid) {
      return res.status(400).json({ error: check.reason });
    }

    const takenBy = await Profile.findOne({
      collegeEmail: collegeEmail.toLowerCase(),
      _id: { $ne: req.user._id },
      edu_verified: true,
    });
    if (takenBy) {
      return res.status(409).json({
        error: "This college email is already verified on another account.",
      });
    }

    const existing = await StudentCollegeVerification.findOne({
      userId: req.user._id,
    });
    if (existing && existing.attempts >= 3) {
      return res.status(429).json({
        error: "Too many attempts. Wait for the current code to expire.",
      });
    }

    const otp       = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await StudentCollegeVerification.findOneAndUpdate(
      { userId: req.user._id },
      {
        userId:     req.user._id,
        email:      collegeEmail.toLowerCase(),
        otp,
        domain:     check.domain,
        confidence: check.confidence,
        expiresAt,
        used:       false,
        attempts:   (existing?.attempts || 0) + 1,
      },
      { upsert: true, new: true }
    );

    await sendOTPEmail(collegeEmail, otp, "college-verify");

    res.json({
      sent:       true,
      confidence: check.confidence,
      hint:
        check.confidence === "high"
          ? "Recognised institution — code sent!"
          : "Code sent. Domain will be marked as unverified institution.",
    });
  } catch (err) {
    console.error("send-otp error:", err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

// ─────────────────────────────────────────────
// POST /api/student/college-verify/verify-otp
// ─────────────────────────────────────────────
router.post("/verify-otp", requireAuth, async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) {
      return res.status(400).json({ error: "OTP is required" });
    }

    const pending = await StudentCollegeVerification.findOne({
      userId: req.user._id,
      used:   false,
    });

    if (!pending) {
      return res.status(400).json({
        error: "No pending verification. Please request a new code.",
      });
    }

    if (new Date() > pending.expiresAt) {
      await StudentCollegeVerification.deleteOne({ userId: req.user._id });
      return res.status(400).json({
        error: "Code expired. Please request a new one.",
      });
    }

    if (otp.trim() !== pending.otp) {
      return res.status(400).json({ error: "Incorrect code. Try again." });
    }

    await StudentCollegeVerification.findOneAndUpdate(
      { userId: req.user._id },
      { used: true }
    );

    // Write badge fields onto the Profile document
    const updatedProfile = await Profile.findByIdAndUpdate(
      req.user._id,
      {
        collegeEmail:    pending.email,
        collegeDomain:   pending.domain,
        edu_verified:    true,
        edu_verified_at: new Date(),
        edu_confidence:  pending.confidence,
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "College email verified! Badge added to your profile.",
      badge: {
        edu_verified:    updatedProfile.edu_verified,
        collegeDomain:   updatedProfile.collegeDomain,
        collegeEmail:    updatedProfile.collegeEmail,
        edu_confidence:  updatedProfile.edu_confidence,
        edu_verified_at: updatedProfile.edu_verified_at,
      },
    });
  } catch (err) {
    console.error("verify-otp error:", err);
    res.status(500).json({ error: "Verification failed" });
  }
});

// ─────────────────────────────────────────────
// GET /api/student/college-verify/status
// ─────────────────────────────────────────────
router.get("/status", requireAuth, async (req, res) => {
  try {
    const profile = await Profile.findById(req.user._id).select(
      "collegeEmail collegeDomain edu_verified edu_verified_at edu_confidence"
    );
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch status" });
  }
});

export default router;