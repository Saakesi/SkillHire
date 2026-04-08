import express from "express";
import Referral from "../models/Referral.js";
import Profile from "../models/Profile.js";
import { requireAuth } from "../middleware/auth.js";
 
const router = express.Router();
 
// ─────────────────────────────────────────────
// GET /api/referrals/open
// List all users who are open to referral (no auth needed)
// ─────────────────────────────────────────────
router.get("/open", async (req, res) => {
  try {
    const users = await Profile.find({ openToReferral: true })
      .select("username name avatarUrl company referralCompany referralNote edu_verified collegeDomain")
      .lean();
 
    res.json({ users, count: users.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
 
// ─────────────────────────────────────────────
// POST /api/referrals/request/:username
// Anyone can request a referral if that user is openToReferral
// ─────────────────────────────────────────────
router.post("/request/:username", requireAuth, async (req, res) => {
  try {
    const { company, message, resumeUrl } = req.body;
 
    if (!company) {
      return res.status(400).json({ error: "Company is required." });
    }
 
    const recipient = await Profile.findOne({ username: req.params.username });
 
    if (!recipient) {
      return res.status(404).json({ error: "User not found." });
    }
 /*
    if (recipient._id.equals(req.user._id)) {
      return res.status(400).json({ error: "Cannot request referral from yourself." });
    }
 */
    if (!recipient.openToReferral) {
      return res.status(403).json({ error: "This user is not open to referrals." });
    }
 
    // Check if request already exists
    const existing = await Referral.findOne({
      from:    req.user._id,
      to:      recipient._id,
      company: company.trim()
    });
 
    if (existing) {
      const msgs = {
        pending:  "You already sent a referral request to this person for this company.",
        accepted: "Your referral request was already accepted.",
        rejected: "Your referral request was previously rejected."
      };
      return res.status(409).json({ error: msgs[existing.status] });
    }
 
    const referral = await Referral.create({
      from:      req.user._id,
      to:        recipient._id,
      company:   company.trim(),
      message:   message ?? null,
      resumeUrl: resumeUrl ?? null
    });
 
    res.json({
      success: true,
      message: `Referral request sent to ${recipient.name} for ${company}.`,
      referral
    });
 
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
 
// ─────────────────────────────────────────────
// GET /api/referrals/incoming
// See all referral requests sent to the logged-in user
// ─────────────────────────────────────────────
router.get("/incoming", requireAuth, async (req, res) => {
  try {
    const referrals = await Referral.find({
      to:     req.user._id,
      status: "pending"
    }).populate("from", "username name avatarUrl company collegeDomain edu_verified");
 
    res.json({ referrals, count: referrals.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
 
// ─────────────────────────────────────────────
// GET /api/referrals/sent
// See all referral requests the logged-in user has sent
// ─────────────────────────────────────────────
router.get("/sent", requireAuth, async (req, res) => {
  try {
    const referrals = await Referral.find({ from: req.user._id })
      .populate("to", "username name avatarUrl company collegeDomain edu_verified");
 
    res.json({ referrals, count: referrals.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
 
// ─────────────────────────────────────────────
// POST /api/referrals/accept/:referralId
// Accept a referral request → unlocks messaging
// ─────────────────────────────────────────────
router.post("/accept/:referralId", requireAuth, async (req, res) => {
  try {
    const referral = await Referral.findById(req.params.referralId);
 
    if (!referral) {
      return res.status(404).json({ error: "Referral request not found." });
    }
 
    if (!referral.to.equals(req.user._id)) {
      return res.status(403).json({ error: "Not authorised." });
    }
 
    if (referral.status !== "pending") {
      return res.status(400).json({ error: "Referral is no longer pending." });
    }
 
    referral.status = "accepted";
    await referral.save();
 
    res.json({
      success: true,
      message: "Referral accepted. You can now message each other.",
      referralId: referral._id
    });
 
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
 
// ─────────────────────────────────────────────
// POST /api/referrals/reject/:referralId
// ─────────────────────────────────────────────
router.post("/reject/:referralId", requireAuth, async (req, res) => {
  try {
    const referral = await Referral.findById(req.params.referralId);
 
    if (!referral) {
      return res.status(404).json({ error: "Referral request not found." });
    }
 
    if (!referral.to.equals(req.user._id)) {
      return res.status(403).json({ error: "Not authorised." });
    }
 
    if (referral.status !== "pending") {
      return res.status(400).json({ error: "Referral is no longer pending." });
    }
 
    referral.status = "rejected";
    await referral.save();
 
    res.json({ success: true, message: "Referral request rejected." });
 
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
 
export default router;