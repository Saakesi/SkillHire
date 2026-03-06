// models/Analysis.js
import mongoose from "mongoose";

const rawMetricsSchema = new mongoose.Schema({
  //popularity metrics of user
  repoCount: { type: Number, default: 0 },
  totalStars: { type: Number, default: 0 },
  totalForks: { type: Number, default: 0 },

  //languages metrics
  languagePercentages: {
    type: Map,
    of: Number,
    default: {}
  },

  primaryLanguage: {
    type: String,
    default: null
  },

  // indicates how much diverse the developer is, higher entropy->more diversity
  languageEntropy: {
    type: Number,
    default: 0
  },

  developerType: { type: String },
  techStack: [String],
  frameworks: {
    type: [String],
    default: []
  },

  // ===== Activity metrics =====
  commitCount6Months: {
    type: Number,
    default: 0
  },

  activeWeeks: {
    type: Number,
    default: 0
  },

  longestStreak: {
    type: Number,
    default: 0
  },

  // ===== Collaboration metrics =====
  prCount: {
    type: Number,
    default: 0
  },

  mergedPRCount: {
    type: Number,
    default: 0
  },

  externalPRs: {
    type: Number,
    default: 0
  },

  issueCount: {
    type: Number,
    default: 0
  },

  // ===== Project Quality =====
  qualityIndicators: {
    readme: { type: Number, default: 0 },
    ci: { type: Number, default: 0 },
    tests: { type: Number, default: 0 },
    docker: { type: Number, default: 0 },
    license: { type: Number, default: 0 }
  }

}, { _id: false });

const analysisSchema = new mongoose.Schema({
  githubId: { type: Number, required: true, index: true },
  status: {
    type: String,
    enum: ["queued", "processing", "completed", "failed"],
    default: "queued"
  },
  rawMetrics: rawMetricsSchema,
  overallScore: {
    type: Number,
    default: null,
    index: true
  },
  // result: { type: Object },
  error: { type: String, default: null }
}, { timestamps: true });

export default mongoose.model("Analysis", analysisSchema);