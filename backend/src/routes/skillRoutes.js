import { Router } from "express";
import {getSkills,updateSkill,fetchGithubMetrics} from "../controllers/skillController.js";

const router = Router();

// get skills of a username
router.get("/:username", getSkills);

// update skill for logged in user
router.put("/update", updateSkill);
router.post("/metrics", fetchGithubMetrics);

export default router;
