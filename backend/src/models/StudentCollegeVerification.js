// models/StudentCollegeVerification.js
import mongoose from "mongoose";

const StudentCollegeVerificationSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  email:      { type: String, required: true, lowercase: true },
  otp:        { type: String, required: true },
  domain:     { type: String, required: true }, 
  attempts:   { type: Number, default: 0 },         // wrong guess counter
  expiresAt:  { type: Date, required: true },
  used:       { type: Boolean, default: false },
});

// Same TTL pattern as your RecruiterOTP — auto-deletes after expiry
StudentCollegeVerificationSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

// One pending verification per user at a time
StudentCollegeVerificationSchema.index({ userId: 1 }, { unique: true });

export default mongoose.model(
  "StudentCollegeVerification",
  StudentCollegeVerificationSchema
);