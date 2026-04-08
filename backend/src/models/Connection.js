// src/models/Connection.js
import mongoose from "mongoose";

const ConnectionSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "blocked"],
      default: "pending"
    },
    // Optional message sent with request
    note: {
      type: String,
      default: null,
      maxlength: 300
    }
  },
  { timestamps: true }
);

// Prevent duplicate connection requests
ConnectionSchema.index({ requester: 1, recipient: 1 }, { unique: true });

export default mongoose.model("Connection", ConnectionSchema);