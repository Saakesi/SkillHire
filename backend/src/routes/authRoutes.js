import express from "express";
import { githubLogin, githubCallback, getMe, logout } from "../controllers/authController.js";
import Profile from "../models/Profile.js";
import jwt from "jsonwebtoken";

const router = express.Router();

router.get("/github", githubLogin);
router.get("/github/callback", githubCallback);
router.get("/me", getMe);
router.post("/logout", logout);

router.get("/dev/token/:username", async (req, res) => {
  const user = await Profile.findOne({ username: req.params.username });
  if (!user) return res.status(404).json({ error: "User not found" });
  
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
  res.json({ token });
});

export default router;
