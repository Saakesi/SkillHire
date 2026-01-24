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

    // Fetch GitHub user
    const userRes = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const githubUser = userRes.data;

    // -------------------------
    // CREATE PROFILE IN MONGO
    // -------------------------
    let profile = await Profile.findOne({ githubId: githubUser.id });
    if (!profile) {
      profile = await Profile.create({
        githubId: githubUser.id,
        username: githubUser.login.toLowerCase(),
        avatarUrl: githubUser.avatar_url,
        bio: "",
        preferences: {},
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // -------------------------
    // CREATE JWT WITH githubId
    // -------------------------
    const jwtToken = jwt.sign(
      {
        githubId: githubUser.id,   // unique GitHub ID
        username: githubUser.login,
        role: "candidate"          // optional: add role
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );


    console.log("✅ SETTING COOKIE FROM GITHUB CALLBACK");
console.log("JWT PAYLOAD:", {
  githubId: githubUser.id,
  username: githubUser.login
});
    // -------------------------
    // SET COOKIE
    // -------------------------
    res.clearCookie("auth", { path: "/" });

    res.cookie("auth", jwtToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",   // set true in production with HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Redirect to frontend dashboard
    res.redirect("http://localhost:5173/dashboard");
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
  res.clearCookie("auth", { path: "/" });
  res.json({ message: "Logged out" });
};
