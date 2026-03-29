import mongoose from "mongoose";

const RecruiterOTPSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true },
  otp: { type: String, required: true },
  purpose: { type: String, enum: ["register", "login"], required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
  // Stores pending registration data (name, company, designation, passwordHash)
  meta: { type: Object, default: {} }
});

// MongoDB TTL — auto-deletes expired OTPs
RecruiterOTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("RecruiterOTP", RecruiterOTPSchema);
