import mongoose from "mongoose";
 
const referralSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true
    },
    company: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      trim: true,
      maxlength: 500
    },
    resumeUrl: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending"
    }
  },
  { timestamps: true }
);
 
// One referral request per pair per company
referralSchema.index({ from: 1, to: 1, company: 1 }, { unique: true });
 
export default mongoose.model("Referral", referralSchema);