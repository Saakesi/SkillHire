// src/middleware/auth.js
import jwt from "jsonwebtoken";
import Profile from "../models/Profile.js";
import { extractAuthToken } from "../utils/authToken.js";

export const requireAuth = async (req, res, next) => {
  try {
    // 1. Read JWT from cookie — matches how githubCallback sets it
    const token = extractAuthToken(req);

    if (!token) {
      return res.status(401).json({ error: "Not logged in." });
    }

    // 2. Verify — same JWT_SECRET you used in githubCallback
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded = { githubId, username, role, iat, exp }

    // 3. Fetch the actual Profile document from MongoDB for both account types
    const profile = decoded.githubId
      ? await Profile.findOne({ githubId: decoded.githubId })
      : decoded.profileId
        ? await Profile.findById(decoded.profileId)
        : null;

    if (!profile) {
      return res.status(401).json({ error: "User not found." });
    }

    // 4. Attach to req — now req.user is available in all routes
    req.user = profile;

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Session expired. Please log in again." });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid session." });
    }
    console.error("Auth middleware error:", err);
    res.status(500).json({ error: "Authentication check failed." });
  }
};
