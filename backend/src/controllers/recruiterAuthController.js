import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Profile from "../models/Profile.js";
import RecruiterOTP from "../models/RecruiterOTP.js";
import { sendOTPEmail } from "../services/email/emailService.js";

const SALT_ROUNDS = 10;

const generateOTP = () => String(crypto.randomInt(100000, 999999));

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax",
  secure: false,
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const issueToken = (profile) =>
  jwt.sign(
    { profileId: profile._id, email: profile.email, role: "recruiter" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

export const registerSendOTP = async (req, res) => {
  try {
    const { email, name, company = "", designation = "", password } = req.body;

    if (!email) return res.status(400).json({ error: "Email is required" });
    if (!name) return res.status(400).json({ error: "Name is required" });
    if (!password) return res.status(400).json({ error: "Password is required" });
    if (password.length < 8)
      return res.status(400).json({ error: "Password must be at least 8 characters" });

    const existing = await Profile.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists. Please log in." });
    }

    await RecruiterOTP.deleteMany({ email });

    const otp = generateOTP();
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await RecruiterOTP.create({
      email, otp, purpose: "register", expiresAt,
      meta: { name, company, designation, passwordHash },
    });

    await sendOTPEmail(email, otp, "register");

    return res.json({ message: `Verification code sent to ${email}` });
  } catch (err) {
    console.error("registerSendOTP error:", err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

export const registerVerifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: "Email and OTP are required" });

    const record = await RecruiterOTP.findOne({ email, purpose: "register", used: false });

    if (!record) return res.status(400).json({ error: "No pending registration found. Please start over." });
    if (record.otp !== String(otp)) return res.status(400).json({ error: "Incorrect code" });
    if (record.expiresAt < new Date()) return res.status(400).json({ error: "Code expired. Please request a new one." });

    const { name, company, designation, passwordHash } = record.meta;

    record.used = true;
    await record.save();

    const profile = await Profile.create({
      accountType: "recruiter",
      email, name, company, designation, passwordHash,
    });

    res.clearCookie("auth", { path: "/" });
    res.cookie("auth", issueToken(profile), COOKIE_OPTS);

    return res.status(201).json({
      message: "Account created",
      recruiter: {
        id: profile._id, email: profile.email,
        name: profile.name, company: profile.company, designation: profile.designation,
      },
    });
  } catch (err) {
    console.error("registerVerifyOTP error:", err);
    res.status(500).json({ error: "Verification failed" });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

    const profile = await Profile.findOne({ email: email.toLowerCase(), accountType: "recruiter" })
      .select("+passwordHash");
    if (!profile) return res.status(401).json({ error: "No account found with this email" });

    const match = await bcrypt.compare(password, profile.passwordHash);
    if (!match) return res.status(401).json({ error: "Incorrect password" });

    res.clearCookie("auth", { path: "/" });
    res.cookie("auth", issueToken(profile), COOKIE_OPTS);

    return res.json({
      message: "Logged in",
      recruiter: {
        id: profile._id, email: profile.email,
        name: profile.name, company: profile.company, designation: profile.designation,
      },
    });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
};


export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const old = await RecruiterOTP.findOne({ email, purpose: "register", used: false });
    if (!old) return res.status(400).json({ error: "No pending registration. Please start over." });

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    old.otp = otp;
    old.expiresAt = expiresAt;
    await old.save();

    await sendOTPEmail(email, otp, "register");
    return res.json({ message: "New code sent" });
  } catch (err) {
    res.status(500).json({ error: "Failed to resend" });
  }
};


export const getRecruiterMe = async (req, res) => {
  try {
    const token = req.cookies.auth;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "recruiter") return res.status(403).json({ error: "Not a recruiter account" });

    const profile = await Profile.findById(decoded.profileId).select("-githubAccessToken -passwordHash");
    if (!profile) return res.status(404).json({ error: "Profile not found" });

    return res.json({ role: "recruiter", profile });
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};


export const updateRecruiterProfile = async (req, res) => {
  try {
    const token = req.cookies.auth;
    if (!token) return res.status(401).json({ error: "Not authenticated" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "recruiter") return res.status(403).json({ error: "Forbidden" });

    const {
      name,
      company,
      designation,
      openToReferral,
      referralCompany,
      referralNote,
    } = req.body;

    const update = {
      name,
      company,
      designation,
      updatedAt: new Date(),
    };

    if (typeof openToReferral === "boolean") {
      update.openToReferral = openToReferral;
      update.referralCompany = openToReferral ? (referralCompany || "") : "";
      update.referralNote = openToReferral ? (referralNote || "") : "";
    }

    const profile = await Profile.findByIdAndUpdate(
      decoded.profileId,
      update,
      { new: true }
    );
    return res.json({
      name: profile.name,
      company: profile.company,
      designation: profile.designation,
      openToReferral: profile.openToReferral,
      referralCompany: profile.referralCompany,
      referralNote: profile.referralNote,
    });
  } catch {
    res.status(500).json({ error: "Update failed" });
  }
};


export const changePassword = async (req, res) => {
  try {
    const token = req.cookies.auth;
    if (!token) return res.status(401).json({ error: "Not authenticated" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "recruiter") return res.status(403).json({ error: "Forbidden" });

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: "Both fields required" });
    if (newPassword.length < 8) return res.status(400).json({ error: "New password must be at least 8 characters" });

    const profile = await Profile.findById(decoded.profileId).select("+passwordHash");
    const match = await bcrypt.compare(currentPassword, profile.passwordHash);
    if (!match) return res.status(401).json({ error: "Current password is incorrect" });

    profile.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    profile.updatedAt = new Date();
    await profile.save();

    return res.json({ message: "Password updated" });
  } catch {
    res.status(500).json({ error: "Failed to change password" });
  }
};


export const recruiterLogout = (req, res) => {
  res.clearCookie("auth", { httpOnly: true, sameSite: "lax", secure: false, path: "/" });
  res.json({ message: "Logged out" });
};
