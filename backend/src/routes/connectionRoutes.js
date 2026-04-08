import express from "express";
import Connection from "../models/Connection.js";
import Profile from "../models/Profile.js";
import { requireAuth } from "../middleware/auth.js";
 
const router = express.Router();
 
router.get("/all", requireAuth, async (req, res) => {
  const all = await Connection.find({});
  res.json(all);
});
 
// DELETE /api/connections/clear-all  ← dev/testing only, remove before production
router.delete("/clear-all", async (req, res) => {
  try {
    await Connection.deleteMany({});
    res.json({ success: true, message: "All connections cleared." });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});
 
// ─────────────────────────────────────────────
// POST /api/connections/request/:username
// Send a connection request
// ─────────────────────────────────────────────
router.post("/request/:username", requireAuth, async (req, res) => {
  try {
    const { note } = req.body;
 
    const recipient = await Profile.findOne({ username: req.params.username });
 
    if (!recipient) {
      return res.status(404).json({ error: "User not found." });
    }
 
    if (recipient._id.equals(req.user._id)) {
      return res.status(400).json({ error: "Cannot connect with yourself." });
    }
      
 
    const existing = await Connection.findOne({
      $or: [
        { requester: req.user._id, recipient: recipient._id },
        { requester: recipient._id, recipient: req.user._id }
      ]
    });
 
    if (existing) {
      const messages = {
        pending:  "Connection request already sent.",
        accepted: "You are already connected.",
        declined: "This request was previously declined.",
        blocked:  "Cannot send request."
      };
      return res.status(409).json({ error: messages[existing.status] });
    }
 
    const connection = await Connection.create({
      requester: req.user._id,
      recipient: recipient._id,
      note:      note ?? null
    });
 
    res.json({
      success: true,
      message: `Connection request sent to ${recipient.name}.`,
      connection
    });
 
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
 
// ─────────────────────────────────────────────
// POST /api/connections/accept/:connectionId
// Accept a pending request → increment both profiles
// ─────────────────────────────────────────────
router.post("/accept/:connectionId", requireAuth, async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.connectionId);
 
    if (!connection) {
      return res.status(404).json({ error: "Request not found." });
    }
 
    // Only recipient can accept
    if (!connection.recipient.equals(req.user._id)) {
      return res.status(403).json({ error: "Not authorised." });
    }
 
    if (connection.status !== "pending") {
      return res.status(400).json({ error: "Request is no longer pending." });
    }
 
    connection.status = "accepted";
    await connection.save();
 
    // ✅ Increment connectionCount for both users
    await Profile.findByIdAndUpdate(connection.requester, {
      $inc: { connectionCount: 1 }
    });
    await Profile.findByIdAndUpdate(connection.recipient, {
      $inc: { connectionCount: 1 }
    });
 
    res.json({ success: true, message: "Connection accepted." });
 
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
 
// ─────────────────────────────────────────────
// POST /api/connections/decline/:connectionId
// ─────────────────────────────────────────────
router.post("/decline/:connectionId", requireAuth, async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.connectionId);
 
    if (!connection) {
      return res.status(404).json({ error: "Request not found." });
    }
 
    if (!connection.recipient.equals(req.user._id)) {
      return res.status(403).json({ error: "Not authorised." });
    }
 
    if (connection.status !== "pending") {
      return res.status(400).json({ error: "Request is no longer pending." });
    }
 
    connection.status = "declined";
    await connection.save();
 
    res.json({ success: true, message: "Connection declined." });
 
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
 
// ─────────────────────────────────────────────
// DELETE /api/connections/remove/:username
// Remove an existing connection → decrement both profiles
// ─────────────────────────────────────────────
router.delete("/remove/:username", requireAuth, async (req, res) => {
  try {
    const other = await Profile.findOne({ username: req.params.username });
    if (!other) return res.status(404).json({ error: "User not found." });
 
    const connection = await Connection.findOneAndDelete({
      $or: [
        { requester: req.user._id, recipient: other._id },
        { requester: other._id,    recipient: req.user._id }
      ],
      status: "accepted"
    });
 
    if (!connection) {
      return res.status(404).json({ error: "No accepted connection found." });
    }
 
    // ✅ Decrement connectionCount for both users, floor at 0
    await Profile.findByIdAndUpdate(connection.requester, {
      $inc: { connectionCount: -1 }
    });
    await Profile.findByIdAndUpdate(connection.recipient, {
      $inc: { connectionCount: -1 }
    });
 
    // ✅ Safety: prevent negative counts
    await Profile.updateMany(
      { _id: { $in: [connection.requester, connection.recipient] }, connectionCount: { $lt: 0 } },
      { $set: { connectionCount: 0 } }
    );
 
    res.json({ success: true, message: "Connection removed." });
 
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
 
// ─────────────────────────────────────────────
// GET /api/connections/pending
// Incoming requests waiting for your response
// ─────────────────────────────────────────────
router.get("/pending", requireAuth, async (req, res) => {
  try {
    const pending = await Connection.find({
      recipient: req.user._id,
      status:    "pending"
    }).populate("requester", "username name avatarUrl collegeDomain edu_verified");
 
    res.json({ pending, count: pending.length });
 
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
 
// ─────────────────────────────────────────────
// GET /api/connections/list
// All accepted connections for logged-in user
// ─────────────────────────────────────────────
router.get("/list", requireAuth, async (req, res) => {
  try {
    const connections = await Connection.find({
      $or: [
        { requester: req.user._id },
        { recipient: req.user._id }
      ],
      status: "accepted"
    }).populate(
      "requester recipient",
      "username name avatarUrl collegeDomain edu_verified edu_is_alumni company connectionCount"
    );
 
    const people = connections.map(c => {
      const isRequester = c.requester._id.equals(req.user._id);
      const other = isRequester ? c.recipient : c.requester;
      return {
        connectionId: c._id,
        connectedAt:  c.updatedAt,
        user:         other
      };
    });
 
    res.json({ connections: people, count: people.length });
 
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
 
// ─────────────────────────────────────────────
// GET /api/connections/status/:username
// Check connection status with a specific user
// ─────────────────────────────────────────────
router.get("/status/:username", requireAuth, async (req, res) => {
  try {
    const other = await Profile.findOne({ username: req.params.username });
    if (!other) return res.status(404).json({ error: "User not found." });
 
    const connection = await Connection.findOne({
      $or: [
        { requester: req.user._id, recipient: other._id },
        { requester: other._id,    recipient: req.user._id }
      ]
    });
 
    if (!connection) {
      return res.json({ status: "none" });
    }
 
    res.json({
      status:       connection.status,
      connectionId: connection._id,
      isSender:     connection.requester.equals(req.user._id)
    });
 
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─────────────────────────────────────────────
// GET /api/connections/suggestions
// People you might know — no college gate
// ─────────────────────────────────────────────
// GET /api/connections/suggestions
router.get("/suggestions", requireAuth, async (req, res) => {
  try {
    const currentUser = await Profile.findById(req.user._id);

    // Get all existing connections (any status)
    const connections = await Connection.find({
      $or: [
        { requester: req.user._id },
        { recipient: req.user._id }
      ]
    });

    const excludeIds = connections.map(c =>
      c.requester.equals(req.user._id) ? c.recipient : c.requester
    );
    excludeIds.push(req.user._id);

    // Fetch candidates
    const candidates = await Profile.find({
      _id: { $nin: excludeIds }
    }).lean();

    // Score each candidate
    const scored = candidates.map(candidate => {
      let score = 0;
      const reasons = [];
      const tags = [];

      // --- College match ---
      const sameCollege =
        currentUser.collegeDomain &&
        candidate.collegeDomain &&
        currentUser.collegeDomain === candidate.collegeDomain;

      if (sameCollege) {
        score += 40;
        reasons.push(`Goes to your college`);
      }

      // --- Same batch year ---
      if (sameCollege && candidate.gradYear === currentUser.gradYear) {
        score += 20;
        reasons.push(`Batchmate (${candidate.gradYear})`);
        tags.push("🎓 Batchmate");
      }

      // --- Skill overlap ---
      const sharedSkills = (currentUser.skills || []).filter(s =>
        (candidate.skills || []).includes(s)
      );
      if (sharedSkills.length > 0) {
        score += sharedSkills.length * 5;
        reasons.push(`Shares skills: ${sharedSkills.slice(0, 3).join(", ")}`);
      }

      // --- Open to referral ---
      if (candidate.openToReferral) {
        score += 15;
        tags.push("🔗 Open to Referral");
      }

      // --- Actively hiring ---
      if (candidate.isHiring) {
        score += 15;
        tags.push("🔥 Hiring");
      }

      // --- Edu verified ---
      if (candidate.edu_verified) {
        score += 10;
        tags.push("✅ Edu Verified");
      }

      // --- Same company domain ---
      if (
        currentUser.company &&
        candidate.company &&
        currentUser.company.toLowerCase() === candidate.company.toLowerCase()
      ) {
        score += 10;
        reasons.push(`Works at ${candidate.company} like you`);
      }

      // --- Build human-readable sentence ---
      let sentence = `${candidate.name}`;
      if (candidate.company) sentence += ` works at ${candidate.company}`;
      if (candidate.role) sentence += ` as a ${candidate.role}`;
      if (sameCollege) sentence += ` and is from your college`;
      sentence += ".";

      return {
        _id:           candidate._id,
        name:          candidate.name,
        username:      candidate.username,
        company:       candidate.company,
        role:          candidate.role,
        collegeDomain: candidate.collegeDomain,
        gradYear:      candidate.gradYear,
        edu_verified:  candidate.edu_verified,
        openToReferral: candidate.openToReferral,
        isHiring:      candidate.isHiring,
        score,
        tags,           // e.g. ["🔥 Hiring", "🎓 Batchmate"]
        reason:  reasons.join(" · "),   // e.g. "Goes to your college · Shares skills: React, Node"
        sentence        // e.g. "Rahul works at Razorpay as a backend dev and is from your college."
      };
    });

    // Sort by score descending, take top 20
    const suggestions = scored
      .filter(s => s.score > 0 || candidates.length < 10) // show all if few users
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    res.json({ suggestions });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;