import mongoose from "mongoose";

const shortlistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: "" },
  developers: [{ type: Number }], // githubIds
  createdAt: { type: Date, default: Date.now },
});

const ProfileSchema = new mongoose.Schema({
  // ── developer fields ────────────────────────────────────────────────────────
  githubId: {
    type: Number,
    unique: true,
    sparse: true
  },
  username: {
    type: String,
    unique: true,
    sparse: true
  },
  avatarUrl: { type: String },
  bio: { type: String, default: "" },
  preferences: { type: Object, default: {} },
  analysis: {
    totalStars: Number,
    repoCount: Number,
    updatedAt: Date
  },
  githubAccessToken: {
    type: String,
    select: false
  },
  leetcodeUsername: {
    type: String,
    default: null,
    index: true
  },


  name: { type: String },
  connectionCount: { type: Number, default: 0 },
  college: {
    id: { type: String },
    name: { type: String },
    country: { type: String },
  },
  branch: { type: String },
  graduationYear: { type: Number },
  currentCompany: { type: String },
  role: { type: String },
  openToReferral: { type: Boolean, default: false },
  referralCompany: { type: String },
referralNote:    { type: String },
  score: { type: Number, default: 0 },


  accountType: {
    type: String,
    enum: ["developer", "recruiter"],
    default: "developer",
  },

// for recruiter
  email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  passwordHash: { type: String, select: false },
  company: { type: String, default: "" },
  designation: { type: String, default: "" },
  shortlists: { type: [shortlistSchema], default: undefined },
  collegeEmail:    { type: String,  default: null },
collegeDomain:   { type: String,  default: null },
edu_verified:    { type: Boolean, default: false },
edu_verified_at: { type: Date,    default: null },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Profile", ProfileSchema);
