import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./src/routes/authRoutes.js";
import profileRoutes from "./src/routes/profileRoutes.js";
import mongoose from "mongoose";
import analyzeRoutes from "./src/routes/analyzeRoutes.js";

console.log("🔥🔥🔥 BACKEND STARTED FROM:", process.cwd());

dotenv.config();
console.log("CLIENT ID:", process.env.GITHUB_CLIENT_ID);


const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/analyze", analyzeRoutes);

app.get("/api/me", (req, res) => {
  const token = req.cookies.auth;
  if (!token) return res.status(401).json({ authenticated: false });
  res.json({ authenticated: true });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));
