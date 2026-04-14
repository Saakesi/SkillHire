import axios from "axios";
import jwt from "jsonwebtoken";
import { addFetchReposJob } from "../jobs/fetchReposJob.js";
import Profile from "../models/Profile.js"; // your Mongoose model

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

export const githubLogin = (req, res) => {
  // Added 'read:repo' to scope to access private repos (read-only)
  const url = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=repo read:user`;
  res.redirect(url);
};


export const githubCallback = async (req, res) => {
  const { code } = req.query;

  try {
    // Exchange code for access token
    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      },
      { headers: { Accept: "application/json" } }
    );

    const accessToken = tokenRes.data.access_token;
    if (!accessToken) throw new Error("GitHub token not received");

    // Fetch GitHub user
    const userRes = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const githubUser = userRes.data;

    // console.log("GitHub user:", {
    //   id: githubUser.id,
    //   login: githubUser.login,
    //   avatar: githubUser.avatar_url
    // });

    // -------------------------
    // CREATE PROFILE IN MONGO
    // -------------------------
    let profile = await Profile.findOne({ githubId: githubUser.id });
    if (!profile) {
      profile = await Profile.create({
        githubId: githubUser.id,
        name: githubUser.name,
        username: githubUser.login.toLowerCase(),
        avatarUrl: githubUser.avatar_url,
        bio: githubUser.bio || "",
        preferences: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        githubAccessToken: accessToken,
      });

      // console.log("Profile saved:", {
      //   id: profile._id,
      //   githubId: profile.githubId,
      //   username: profile.username
      // });
    }
    else {
      // update avatar & token in case they changed
      profile.avatarUrl = githubUser.avatar_url;
      profile.githubAccessToken = accessToken;
      profile.updatedAt = new Date();
      await profile.save();
    }

    // -------------------------
    // CREATE JWT WITH githubId
    // -------------------------
    const jwtToken = jwt.sign(
      {
        githubId: githubUser.id,   // unique GitHub ID
        username: githubUser.login,
        role: "developer"          // optional: add role
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );


    // -------------------------
    // SET COOKIE
    // -------------------------
    res.clearCookie("auth", { path: "/" });

    res.cookie("auth", jwtToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      path: "/",   // set true in production with HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Redirect to frontend dashboard
    res.redirect(`${FRONTEND_URL}/dashboard`);
  } catch (err) {
      console.error("ERROR:", err.response?.data || err.message);
      res.status(500).json({
      error: "OAuth failed",
      details: err.response?.data || err.message
  });
}
};



export const getMe = async (req, res) => {
  try {
    const token = req.cookies.auth;
    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //recruiter path
    if (decoded.role === "recruiter") {
      const profile = await Profile.findById(decoded.profileId)
        .select("-githubAccessToken -passwordHash");
      if (!profile) return res.status(404).json({ error: "Profile not found" });
      return res.json({ role: "recruiter", profile });
    }

    //developer path
    const profile = await Profile.findOne({ githubId: decoded.githubId })
      .select("-githubAccessToken");

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json({
      githubId: decoded.githubId,
      name: decoded.name,
      username: decoded.username,
      role: decoded.role,
      profile,
    });

  } catch (err) {
    console.error("getMe error:", err);
    res.status(401).json({ error: "Invalid token" });
  }
};


export const logout = (req, res) => {
  console.log("Clearing auth cookie");
  res.clearCookie("auth", {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    path: "/"
  });

  res.json({ message: "Logged out successfully" });
};

