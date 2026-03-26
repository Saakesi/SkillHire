import express from "express";
import {
  leaderboard,
  getUserRank,
  getTop10,
  debugProfiles,
  getCategoryRank,
  getCategoryLeaderboard,
  getUserCategoryRank
} from "../controllers/rankingController.js";

const router = express.Router();

router.get("/leaderboard", leaderboard);
router.get('/rank/debug', debugProfiles); 
router.get("/rank/:username", getUserRank);
router.get("/leaderboard/top10", getTop10);
router.get('/category/:username', getCategoryRank); 
router.get('/leaderboard/:category', getCategoryLeaderboard);         // all users ranked in a category
router.get('/leaderboard/:category/:username', getUserCategoryRank);



export default router;