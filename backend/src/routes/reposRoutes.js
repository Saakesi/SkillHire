import { Router } from "express";
import * as reposCtrl from "../controllers/reposController.js";

const router = Router();

router.get("/:username", reposCtrl.getRecentRepos);
router.post("/analyze/:repoId", reposCtrl.analyzeSingleRepo);

export default router;
