import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import authRoutes from "./src/routes/authRoutes.js";
import profileRoutes from "./src/routes/profileRoutes.js";
import mongoose from "mongoose";
import Profile from "./src/models/Profile.js";
import analyzeRoutes from "./src/routes/analyzeRoutes.js";
import rankingroutes from "./src/routes/rankingRoutes.js";
import collegeRoutes from "./src/routes/collegeRoutes.js";
import recruiterRoutes from "./src/routes/recruiterRoutes.js";
import studentCollegeVerifyRouter from "./src/routes/studentCollegeVerify.js";
import connectionRouter from "./src/routes/connectionRoutes.js";
import referralRoutes from "./src/routes/referralRoutes.js";
import messageRoutes from "./src/routes/messageRoutes.js";


console.log("BACKEND STARTED FROM:", process.cwd());

dotenv.config();
console.log("CLIENT ID:", process.env.GITHUB_CLIENT_ID);

const FRONTEND_URLS = (() => {
  const values = [];

  if (process.env.FRONTEND_URLS) {
    values.push(
      ...process.env.FRONTEND_URLS
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
    );
  }

  if (process.env.FRONTEND_URL) {
    values.push(process.env.FRONTEND_URL.trim());
  }

  if (values.length === 0) {
    values.push("http://localhost:5173");
  }

  return [...new Set(values.map((origin) => origin.replace(/\/+$/, "")))];
})();
const PORT = Number(process.env.PORT || 5000);


const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: FRONTEND_URLS,
    credentials: true,
  },
});

app.set("io", io);

function parseCookies(cookieHeader = "") {
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, part) => {
      const separatorIndex = part.indexOf("=");
      if (separatorIndex === -1) return acc;
      const key = part.slice(0, separatorIndex).trim();
      const value = decodeURIComponent(part.slice(separatorIndex + 1).trim());
      acc[key] = value;
      return acc;
    }, {});
}

io.use(async (socket, next) => {
  try {
    const cookies = parseCookies(socket.handshake.headers.cookie || "");
    const token = cookies.auth;
    if (!token) {
      return next(new Error("Not authenticated"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const profile = decoded.githubId
      ? await Profile.findOne({ githubId: decoded.githubId }).select("_id username")
      : await Profile.findById(decoded.profileId).select("_id username");

    if (!profile) {
      return next(new Error("User not found"));
    }

    socket.user = { _id: profile._id.toString(), username: profile.username };
    next();
  } catch (error) {
    next(new Error("Unauthorized socket"));
  }
});

io.on("connection", (socket) => {
  socket.join(`user:${socket.user._id}`);
});

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const normalizedOrigin = origin.replace(/\/+$/, "");

    if (FRONTEND_URLS.includes(normalizedOrigin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

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
app.use("/api/messages", messageRoutes);
console.log("Router imported");

app.get('/', (req, res) => {
  res.send("Backend is Working!");
})


app.get("/api/me", (req, res) => {
  const token = req.cookies.auth;
  if (!token) return res.status(401).json({ authenticated: false });
  res.json({ authenticated: true });
});

app.get("/ping", (req, res) => {
  res.setTimeout(2000, () => {
    console.log("Ping timeout");
  });

  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
  });
});
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));
