import express from "express";
import Referral from "../models/Referral.js";
import Connection from "../models/Connection.js";
import Profile from "../models/Profile.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// ─────────────────────────────────────────────
// GET /api/referrals/open
// List all users who are open to referral (no auth needed)
// ─────────────────────────────────────────────
router.get("/open", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 8, 1), 50);
    const search = (req.query.search || "").trim();
    const role = (req.query.role || req.query.audience || "all").toLowerCase();

    const currentYear = new Date().getFullYear();
    const andClauses = [
      { openToReferral: true },
      { username: { $exists: true, $ne: null } },
    ];

    if (search) {
      const searchRegex = new RegExp(search, "i");
      andClauses.push({
        $or: [
          { username: searchRegex },
          { name: searchRegex },
          { referralCompany: searchRegex },
          { currentCompany: searchRegex },
          { company: searchRegex },
          { collegeDomain: searchRegex },
        ],
      });
    }

    if (role === "developer") {
      andClauses.push({ accountType: "developer" });
    } else if (role === "recruiter") {
      andClauses.push({ accountType: "recruiter" });
    }

    const query = andClauses.length > 1 ? { $and: andClauses } : andClauses[0];

    const total = await Profile.countDocuments(query);

    const usersRaw = await Profile.find(query)
      .select("username name avatarUrl company currentCompany designation referralCompany referralNote edu_verified collegeDomain accountType graduationYear")
      .sort({ updatedAt: -1, score: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const users = usersRaw.map((user) => {
      let audienceType = "student";

      if (user.accountType === "recruiter") {
        audienceType = "recruiter";
      } else if (user.graduationYear && user.graduationYear < currentYear) {
        audienceType = "alumni";
      } else if (user.currentCompany || user.company) {
        audienceType = "professional";
      }

      return { ...user, audienceType };
    });

    const totalPages = Math.max(Math.ceil(total / limit), 1);

    res.json({
      users,
      count: users.length,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    });
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
      from: req.user._id,
      to: recipient._id,
      company: company.trim()
    });

    if (existing) {
      const msgs = {
        pending: "You already sent a referral request to this person for this company.",
        accepted: "Your referral request was already accepted.",
        rejected: "Your referral request was previously rejected."
      };
      return res.status(409).json({ error: msgs[existing.status] });
    }

    const referral = await Referral.create({
      from: req.user._id,
      to: recipient._id,
      company: company.trim(),
      message: message ?? null,
      resumeUrl: resumeUrl ?? null
    });

    // Also open a connection thread so the recipient can accept it first and start messaging.
    const existingConnection = await Connection.findOne({
      $or: [
        { requester: req.user._id, recipient: recipient._id },
        { requester: recipient._id, recipient: req.user._id }
      ]
    });

    if (!existingConnection) {
      await Connection.create({
        requester: req.user._id,
        recipient: recipient._id,
        note: message?.trim() || `Referral request for ${company.trim()}`
      });
    }

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
      to: req.user._id,
      status: "pending"
    }).populate("from", "username name avatarUrl company collegeDomain edu_verified");

    res.json({ referrals, count: referrals.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─────────────────────────────────────────────
// GET /api/referrals/received
// See all referral requests received by the logged-in user (all statuses)
// ─────────────────────────────────────────────
router.get("/received", requireAuth, async (req, res) => {
  try {
    const referrals = await Referral.find({ to: req.user._id })
      .sort({ updatedAt: -1 })
      .populate("from", "username name avatarUrl company collegeDomain edu_verified")
      .lean();

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