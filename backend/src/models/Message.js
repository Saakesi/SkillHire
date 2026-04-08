import mongoose from "mongoose";
 
const messageSchema = new mongoose.Schema(
  {
    // One of these will be set depending on how the chat was unlocked
    connectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Connection",
      default: null
    },
    referralId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Referral",
      default: null
    },
 
    // Always store both participants for easy querying
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true
    },
 
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
 
    readAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);
 
// Fast lookup for chat history between two users
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ receiver: 1, sender: 1 });
 
export default mongoose.model("Message", messageSchema);