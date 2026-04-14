import express from "express";
import Message from "../models/Message.js";
import Connection from "../models/Connection.js";
import Referral from "../models/Referral.js";
import Profile from "../models/Profile.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// ─────────────────────────────────────────────
// Helper: check if two users can message each other
// Returns { allowed, connectionId, referralId }
// ─────────────────────────────────────────────
async function canMessage(userAId, userBId) {
  // Check accepted connection
  const connection = await Connection.findOne({
    $or: [
      { requester: userAId, recipient: userBId },
      { requester: userBId, recipient: userAId }
    ],
    status: "accepted"
  });

  if (connection) {
    return { allowed: true, connectionId: connection._id, referralId: null };
  }

  // Check accepted referral (either direction)
  const referral = await Referral.findOne({
    $or: [
      { from: userAId, to: userBId },
      { from: userBId, to: userAId }
    ],
    status: "accepted"
  });

  if (referral) {
    return { allowed: true, connectionId: null, referralId: referral._id };
  }

  return { allowed: false, connectionId: null, referralId: null };
}

// ─────────────────────────────────────────────
// POST /api/messages/:username
// Send a message to a user
// ─────────────────────────────────────────────
router.post("/:username", requireAuth, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Message text is required." });
    }

    const receiver = await Profile.findOne({ username: req.params.username });

    if (!receiver) {
      return res.status(404).json({ error: "User not found." });
    }

    if (receiver._id.equals(req.user._id)) {
      return res.status(400).json({ error: "Cannot message yourself." });
    }

    // ✅ Check if messaging is allowed
    const { allowed, connectionId, referralId } = await canMessage(
      req.user._id,
      receiver._id
    );

    if (!allowed) {
      return res.status(403).json({
        error: "You can only message people you are connected with or have an accepted referral with."
      });
    }

    const message = await Message.create({
      connectionId,
      referralId,
      sender: req.user._id,
      receiver: receiver._id,
      text: text.trim()
    });

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "username name avatarUrl")
      .populate("receiver", "username name avatarUrl")
      .lean();

    const io = req.app.get("io");
    if (io) {
      io.to(`user:${receiver._id.toString()}`).emit("message:new", populatedMessage);
      io.to(`user:${req.user._id.toString()}`).emit("message:new", populatedMessage);
    }

    res.json({ success: true, message: populatedMessage });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─────────────────────────────────────────────
// GET /api/messages/:username
// Get chat history with a specific user
// ─────────────────────────────────────────────
router.get("/:username", requireAuth, async (req, res) => {
  try {
    const other = await Profile.findOne({ username: req.params.username });

    if (!other) {
      return res.status(404).json({ error: "User not found." });
    }

    // ✅ Must be allowed to message to view history
    const { allowed } = await canMessage(req.user._id, other._id);

    if (!allowed) {
      return res.status(403).json({ error: "Not authorised to view this conversation." });
    }

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: other._id },
        { sender: other._id, receiver: req.user._id }
      ]
    })
      .sort({ createdAt: 1 })  // oldest first
      .populate("sender", "username name avatarUrl")
      .lean();

    // Mark unread messages as read
    await Message.updateMany(
      { sender: other._id, receiver: req.user._id, readAt: null },
      { $set: { readAt: new Date() } }
    );

    res.json({ messages, count: messages.length });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─────────────────────────────────────────────
// GET /api/messages
// Get all conversations (inbox) for logged-in user
// ─────────────────────────────────────────────
router.get("/", requireAuth, async (req, res) => {
  try {
    // Get last message per conversation
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: req.user._id },
            { receiver: req.user._id }
          ]
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $lt: ["$sender", "$receiver"] },
              { a: "$sender", b: "$receiver" },
              { a: "$receiver", b: "$sender" }
            ]
          },
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$receiver", req.user._id] },
                    { $eq: ["$readAt", null] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      { $replaceRoot: { newRoot: { $mergeObjects: ["$lastMessage", { unreadCount: "$unreadCount" }] } } },
      { $sort: { createdAt: -1 } }
    ]);

    // Populate sender/receiver names
    await Message.populate(messages, [
      { path: "sender", select: "username name avatarUrl" },
      { path: "receiver", select: "username name avatarUrl" }
    ]);

    res.json({ conversations: messages, count: messages.length });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;