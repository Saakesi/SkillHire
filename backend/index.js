import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./src/routes/authRoutes.js";
import profileRoutes from "./src/routes/profileRoutes.js";
import mongoose from "mongoose";
import analyzeRoutes from "./src/routes/analyzeRoutes.js";
import rankingroutes from "./src/routes/rankingRoutes.js";
import collegeRoutes from "./src/routes/collegeRoutes.js";
import recruiterRoutes from "./src/routes/recruiterRoutes.js";
import studentCollegeVerifyRouter from "./src/routes/studentCollegeVerify.js";
import connectionRouter from "./src/routes/connectionRoutes.js";
import referralRoutes from "./src/routes/referralRoutes.js";
import messageRoutes  from "./src/routes/messageRoutes.js";


console.log("BACKEND STARTED FROM:", process.cwd());

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
app.use("/api/ranking", rankingroutes);
app.use("/api/colleges", collegeRoutes);
app.use("/api/recruiter", recruiterRoutes);
app.use("/api/student/college-verify", studentCollegeVerifyRouter);
app.use("/api/connections", connectionRouter);
app.use("/api/referrals", referralRoutes);
app.use("/api/messages",  messageRoutes);
console.log("Router imported");

app.get('/', (req, res) => {
  res.send("Backend is Working!");
})


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
