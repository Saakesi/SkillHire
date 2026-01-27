import express from "express";
import { analyzeProfile, getAnalyzeStatus } from "../controllers/analyzeController.js";

const router = express.Router();

router.post("/", analyzeProfile); // Queue analysis job
router.get("/status/:username", getAnalyzeStatus); // Check job status

export default router;
