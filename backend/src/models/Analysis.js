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
  techStack: [String]

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
