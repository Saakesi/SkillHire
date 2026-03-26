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

  skills: {
    type: [String],
    default: [],
    index: true
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

  monthlyCommits: {
    type: Map,
    of: Number,
    default: {}
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
    type: Map,
    of: Number,
    default: {}
  }

}, { _id: false });

const leetcodeSchema = new mongoose.Schema({

  username: String,
  solved: {
    total: Number,
    easy: Number,
    medium: Number,
    hard: Number
  },
  ranking: Number,
  reputation: Number,
  contest: {
    rating: Number,
    globalRank: Number,
    contestsAttended: Number
  },
  languages: [
    {
      languageName: String,
      problemsSolved: Number
    }
  ],
  algorithms: {
    advanced: [
      {
        tagName: String,
        problemsSolved: Number
      }
    ],
    intermediate: [
      {
        tagName: String,
        problemsSolved: Number
      }
    ],
    fundamental: [
      {
        tagName: String,
        problemsSolved: Number
      }
    ]
  }
}, { _id: false });

const analysisSchema = new mongoose.Schema({
  githubId: { type: Number, required: true, index: true },
  username: { type: String, index: true },
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
  finalScore: Number,

  scoreBreakdown: {
    normalizedScores: { type: Object },
    weightedScore: Number,
    penalty: Number,
    trustScore: Number,
    confidenceScore: Number,
    finalScore: Number
  },
  badges: {
    type: [String],
    default: [],
    index: true
  },
  leetcodeScore: {
  type: Number,
  default: 0
  },
  leetcodeMetrics: leetcodeSchema,
  error: { type: String, default: null }
}, { timestamps: true });

analysisSchema.index({ overallScore: -1 });

export default mongoose.model("Analysis", analysisSchema);