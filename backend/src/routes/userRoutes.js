import express from "express";
import { getUserInsights } from "../controllers/userInsightsController.js";

const router = express.Router();

router.get("/:id/insights", getUserInsights);

export default router;
