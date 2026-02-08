import axios from "axios";
import jwt from "jsonwebtoken";
import { addFetchReposJob } from "../jobs/fetchReposJob.js";
import Profile from "../models/Profile.js"; // your Mongoose model

export const githubLogin = (req, res) => {
  // Added 'read:repo' to scope to access private repos (read-only)
  const url = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user,read:repo`;
  res.redirect(url);
};


export const githubCallback = async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).json({ error: "Missing code" });

  try {
    // Exchange code for access token
    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: "application/json" } }
    );

    const accessToken = tokenRes.data.access_token;
    if (!accessToken) throw new Error("GitHub access token not received");

    // Fetch user profile from GitHub
    const userRes = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const githubUser = userRes.data;

    // Save/update user profile
    await Profile.findOneAndUpdate(
      { githubId: githubUser.id },
      {
        githubId: githubUser.id,
        username: githubUser.login.toLowerCase(),
        avatarUrl: githubUser.avatar_url,
        bio: githubUser.bio || "",
        githubAccessToken: accessToken,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // Issue JWT
    const jwtToken = jwt.sign(
      { githubId: githubUser.id, username: githubUser.login, role: "candidate" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.clearCookie("auth", { path: "/" });
    res.cookie("auth", jwtToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect(process.env.FRONTEND_URL || "http://localhost:5173/dashboard");
  } catch (err) {
    console.error("Error in GitHub OAuth callback:", err);
    res.status(500).json({ error: "OAuth failed" });
  }
};





export const getMe = (req, res) => {
  try {
    const token = req.cookies.auth; // read JWT from cookie

    if (!token) return res.status(401).json({ error: "Not logged in" });

    const user = jwt.verify(token, process.env.JWT_SECRET);

    // return user info
    res.json({ githubId: user.githubId, username: user.username });

  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};


export const logout = (req, res) => {
  console.log("🧹 Clearing auth cookie");
  res.clearCookie("auth", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/"
  });

  res.json({ message: "Logged out" });
};
