import { Router } from "express";
import { authMiddleware } from "../utils/middlewares/authMiddleware";
import {
  getAchievements,
  getLeaderboardController,
} from "../controllers/gamificationController";

const router = Router();

router.get("/achievements", authMiddleware, getAchievements);
router.get("/leaderboard", getLeaderboardController); // Public endpoint

export default router;
