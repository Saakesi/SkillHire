import mongoose from "mongoose";

const ProfileSchema = new mongoose.Schema({
  githubId: { type: Number, required: true, unique: true },
  name: { type: String },
  username: { type: String, required: true, unique: true, sparse: true },
  avatarUrl: { type: String },
  bio: { type: String, default: "" },
  preferences: { type: Object, default: {} }, // store any user settings
  analysis: {
    totalStars: Number,
    repoCount: Number,
    updatedAt: Date
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  githubAccessToken: {
    type: String,
    select: false
  },
  leetcodeUsername: {
    type: String,
    default: null,
    index: true
  },
  college: {
  id: { type: String },
  name: { type: String },
  country: { type: String }
},
branch: { type: String },
graduationYear: { type: Number },

currentCompany: { type: String },
role: { type: String },
openToReferral: {
  type: Boolean,
  default: false
},

score: {
  type: Number,
  default: 0
},
});

// Index username for fast lookup (good for 1M+ users)
//ProfileSchema.index({ username: 1 });

export default mongoose.model("Profile", ProfileSchema);
