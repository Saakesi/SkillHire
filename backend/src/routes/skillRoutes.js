import { Router } from "express";
import * as skillsCtrl from "../controllers/skillsController.js";

const router = Router();

// get skills of a username
router.get("/:username", skillsCtrl.getSkills);

// update skill for logged in user
router.put("/update", skillsCtrl.updateSkill);

export default router;
