

import Profile from "../models/Profile.js";
import jwt from "jsonwebtoken";
import { connection as redis } from "../redisClient.js";

// Helper: get user from JWT cookie
const getUserFromCookie = (req) => {
  const token = req.cookies.auth;
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
};

// ---------------------
// GET /api/profile/me
// ---------------------
export const getMyProfile = async (req, res) => {
  try {
    const user = getUserFromCookie(req);
    // console.log("Cookie JWT decoded user:", user); // log the decoded JWT

    if (!user) {
      console.log("No user found in cookie");
      return res.status(401).json({ error: "Not logged in" });
    }

    // fetch profile
    const profile = await Profile.findOne({ githubId: user.githubId });

    if (!profile) {
      console.log("Profile not found for this GitHub ID");
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json(profile);
  } catch (err) {
    console.error("Error in getMyProfile:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ---------------------
// GET /api/profile/:username
// ---------------------
export const getPublicProfile = async (req, res) => {
  const username = req.params.username.toLowerCase();
  const cacheKey = `profile:${username}`;

  try {
    //check in redis cache
    const cached = await redis.get(cacheKey);

    if (cached) {
      console.log("⚡Redis cache hit");
      return res.json(JSON.parse(cached));
    }

    // Case-insensitive search
    const profile = await Profile.findOne({
      username: { $regex: `^${username}$`, $options: "i" }
    });

    if (!profile) {
      console.log("Profile not found for:", usernameParam);
      return res.status(404).json({ error: "Profile not found" });
    }

    const publicData = {
      username: profile.username,
      avatarUrl: profile.avatarUrl,
      bio: profile.bio
    };

    //Store in Redis for 10 minutes
    await redis.set(cacheKey, JSON.stringify(publicData), "EX", 600);

    res.json(publicData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};


// ---------------------
// PUT /api/profile/update
// ---------------------
export const updateProfile = async (req, res) => {
  const user = getUserFromCookie(req);
  if (!user) return res.status(401).json({ error: "Not logged in" });

  const { bio, preferences, avatarUrl } = req.body;

  try {
    const profile = await Profile.findOneAndUpdate(
      { githubId: user.githubId },
      {
        bio,
        preferences,
        avatarUrl,
        updatedAt: new Date()
      },
      { new: true, upsert: true } // create if doesn't exist
    );

    // Clear Redis cache for this user
    if (profile.username) {
      await redisClient.del(`profile:${profile.username}`);
    }

    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

