import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { checkAchievements } from "../services/achievementService";
import { getLeaderboard } from "../services/leaderboardService";
import { handleError } from "../utils/errorHandler";
import { ERRORS } from "../constants/errors";

const prisma = new PrismaClient();

export const getAchievements = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = (req.user as any)?.id;
  if (!userId) {
    res.status(401).json({ error: "User not authenticated" });
    return;
  }

  try {
    await checkAchievements(userId);
    const achievements = await prisma.achievement.findMany({
      where: { userId },
    });
    res.status(200).json(achievements);
  } catch (error) {
    handleError(
      res,
      error,
      "Failed to fetch achievements",
      ERRORS.GENERIC.SERVER_ERROR.statusCode
    );
  } finally {
    await prisma.$disconnect();
  }
};

export const getLeaderboardController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const leaderboard = await getLeaderboard();
    res.status(200).json(leaderboard);
  } catch (error) {
    handleError(
      res,
      error,
      "Failed to fetch leaderboard",
      ERRORS.GENERIC.SERVER_ERROR.statusCode
    );
  }
};
