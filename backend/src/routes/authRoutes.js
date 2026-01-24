import express from "express";
import { githubLogin, githubCallback, logout } from "../controllers/authController.js";

const router = express.Router();

router.get("/github", githubLogin);
router.get("/github/callback", githubCallback);
router.post("/logout", logout);

export default router;
