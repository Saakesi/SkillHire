import mongoose from "mongoose";

const shortlistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: "" },
  developers: [{ type: Number }], // githubIds
  createdAt: { type: Date, default: Date.now }
});

const RecruiterSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true },
  company: { type: String, default: "" },
  designation: { type: String, default: "" },
  passwordHash: { type: String, required: true, select: false },
  isVerified: { type: Boolean, default: false },
  shortlists: [shortlistSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Recruiter", RecruiterSchema);
