/*
import Profile from "../models/Profile.js";
import jwt from "jsonwebtoken";
import NodeCache from "node-cache";

// Cache for public profiles (in-memory, fast, TTL = 5 min)
const publicProfileCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

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

// GET /api/profile/me
export const getMyProfile = async (req, res) => {
  const user = getUserFromCookie(req);
  if (!user) return res.status(401).json({ error: "Not logged in" });

  try {
    const profile = await Profile.findOne({ githubId: user.githubId });
    if (!profile) return res.status(404).json({ error: "Profile not found" });

    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// GET /api/profile/:username
export const getPublicProfile = async (req, res) => {
  const username = req.params.username.toLowerCase();

  // Check cache first
  if (publicProfileCache.has(username)) {
    return res.json(publicProfileCache.get(username));
  }

  try {
    const profile = await Profile.findOne({ username });
    if (!profile) return res.status(404).json({ error: "Profile not found" });

    // Only send public info
    const publicData = {
      username: profile.username,
      avatarUrl: profile.avatarUrl,
      bio: profile.bio
    };

    // Store in cache
    publicProfileCache.set(username, publicData);

    res.json(publicData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// PUT /api/profile/update
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

    // Clear cache in case username changed
    if (profile.username) publicProfileCache.del(profile.username);

    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};*/

import Profile from "../models/Profile.js";
import jwt from "jsonwebtoken";
import { createClient } from "redis";

// ---------------------
// Setup Redis client
// ---------------------
const redisClient = createClient({
  url: "redis://127.0.0.1:6379" // default local Redis
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));
await redisClient.connect(); // must await in top-level for ES modules

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
    console.log("Cookie JWT decoded user:", user); // log the decoded JWT

    if (!user) {
      console.log("No user found in cookie");
      return res.status(401).json({ error: "Not logged in" });
    }

    // log type of githubId
    console.log("Type of githubId from JWT:", typeof user.githubId);
    console.log("Github ID from JWT:", user.githubId);

    // fetch profile
    const profile = await Profile.findOne({ githubId: user.githubId });
    console.log("Profile fetched from MongoDB:", profile);

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

  try {
    // Check Redis cache first
    const cached = await redisClient.get(`profile:${username}`);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const profile = await Profile.findOne({ username });
    if (!profile) return res.status(404).json({ error: "Profile not found" });

    const publicData = {
      username: profile.username,
      avatarUrl: profile.avatarUrl,
      bio: profile.bio
    };

    // Save to Redis for 5 minutes
    await redisClient.setEx(`profile:${username}`, 300, JSON.stringify(publicData));

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

