import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./src/routes/authRoutes.js";
import profileRoutes from "./src/routes/profileRoutes.js";
import analyzeRoutes from "./src/routes/analyzeRoutes.js";
import { connectDB } from "./src/connectDB.js";
import skillRoutes from "./src/routes/skillRoutes.js"
import "./src/workers/index.js";

dotenv.config();

console.log("🔥 Backend starting…");

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/analyze", analyzeRoutes);
app.use("/api/skills",skillRoutes);

app.get("/api/me", (req, res) => {
  const token = req.cookies.auth;
  if (!token) return res.status(401).json({ authenticated: false });
  res.json({ authenticated: true });
});

// start server AFTER DB connects
const startServer = async () => {
  await connectDB();

  app.listen(5000, () => {
    console.log("🚀 API Server running on port 5000");
  });
};

startServer();
