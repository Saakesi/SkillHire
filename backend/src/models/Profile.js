import mongoose from "mongoose";

const ProfileSchema = new mongoose.Schema({
  githubId: { type: Number, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  avatarUrl: { type: String },
  bio: { type: String, default: "" },
  preferences: { type: Object, default: {} }, // store any user settings
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index username for fast lookup (good for 1M+ users)
//ProfileSchema.index({ username: 1 });

export default mongoose.model("Profile", ProfileSchema);
