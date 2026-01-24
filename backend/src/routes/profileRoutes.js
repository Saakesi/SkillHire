import express from "express";
import { getMyProfile, getPublicProfile, updateProfile } from "../controllers/profileController.js";

const router = express.Router();

router.get("/me", getMyProfile);
router.get("/:username", getPublicProfile);
router.put("/update", updateProfile);

export default router;
