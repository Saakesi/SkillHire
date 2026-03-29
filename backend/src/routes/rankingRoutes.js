import express from "express";
import {
  leaderboard,
  getUserRank,
  getTop10,
  debugProfiles,
  getCategoryRank,
  getCategoryLeaderboard,
  getUserCategoryRank,
  getFilteredLeaderboard,
  getFilterOptions
} from "../controllers/rankingController.js";

const router = express.Router();

router.get("/leaderboard", leaderboard);
router.get('/rank/debug', debugProfiles);
router.get("/rank/:username", getUserRank);
// NOTE: static routes must come BEFORE /:category to avoid Express matching "filter"/"top10" as a category param
router.get("/leaderboard/top10", getTop10);
router.get("/leaderboard/filter", getFilteredLeaderboard);   // ?college=&batch=&branch=&category=
router.get("/leaderboard/filter-options", getFilterOptions); // distinct colleges/branches/batches
router.get('/category/:username', getCategoryRank);
router.get('/leaderboard/:category', getCategoryLeaderboard);
router.get('/leaderboard/:category/:username', getUserCategoryRank);



export default router;