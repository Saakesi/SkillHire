// models/Analysis.js
import mongoose from "mongoose";

const analysisSchema = new mongoose.Schema({
  githubId: { type: Number, required: true, index: true },
  status: {
    type: String,
    enum: ["queued", "processing", "completed", "failed"],
    default: "queued"
  },
  result: { type: Object },
  error: { type: String },
  updatedAt:{Date} 
}, { timestamps: true });

export default mongoose.model("Analysis", analysisSchema);
