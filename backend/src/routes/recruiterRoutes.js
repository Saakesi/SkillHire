import express from "express";
import {
  registerSendOTP,
  registerVerifyOTP,
  resendOTP,
  login,
  getRecruiterMe,
  updateRecruiterProfile,
  changePassword,
  recruiterLogout,
} from "../controllers/recruiterAuthController.js";
import {
  searchDevelopers,
  getStats,
  createShortlist,
  getShortlists,
  addToShortlist,
  removeFromShortlist,
  deleteShortlist,
} from "../controllers/recruiterController.js";

const router = express.Router();

// auth
router.post("/auth/register/send-otp", registerSendOTP);
router.post("/auth/register/verify-otp", registerVerifyOTP);
router.post("/auth/register/resend-otp", resendOTP);
router.post("/auth/login", login);
router.get("/auth/me", getRecruiterMe);
router.put("/auth/profile", updateRecruiterProfile);
router.put("/auth/change-password", changePassword);
router.post("/auth/logout", recruiterLogout);

// dashboard
router.get("/search", searchDevelopers);
router.get("/stats", getStats);

// shortlist
router.get("/shortlist", getShortlists);
router.post("/shortlist", createShortlist);
router.post("/shortlist/:id/add", addToShortlist);
router.delete("/shortlist/:id/developer/:githubId", removeFromShortlist);
router.delete("/shortlist/:id", deleteShortlist);

export default router;
