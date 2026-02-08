import mongoose from "mongoose";

const skillSchema = new mongoose.Schema({
  profileId: { type: mongoose.Schema.Types.ObjectId, ref: "Profile", required: true },
  name: { type: String, required: true },
  confidence: { type: Number, default: 0 }, // 0-100
  score: { type: Number, default: 0 },      // weighted score
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Skill", skillSchema);
/*
import mongoose from "mongoose";

const SkillSchema = new mongoose.Schema({
  profileId: mongoose.Schema.Types.ObjectId,
  name: String,

  confidence: Number,      // evidence volume
  weightedScore: Number,   // impact
  trustScore: Number,      // anti-gaming
  finalScore: Number,      // used in UI

  lastUpdated: Date
});

export default mongoose.model("Skill", SkillSchema);

  */