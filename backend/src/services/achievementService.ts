import { PrismaClient } from "@prisma/client";
import { Server } from "socket.io";
import { CONSTANTS } from "../constants/constants";

const prisma = new PrismaClient();
let io: Server | null = null;

export const setIo = (socketIo: Server) => {
  io = socketIo;
};

export const checkAchievements = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { transactions: true, portfolios: true, achievements: true },
  });
  if (!user) throw new Error("User not found");

  const achievementsToCheck = [
    checkFirstTrade,
    checkDiversifiedPortfolio,
    checkProfitMaker,
    checkVolumeTrader,
  ];

  for (const check of achievementsToCheck) {
    await check(user);
  }
};

const checkFirstTrade = async (user: any) => {
  const existing = user.achievements.find(
    (a: any) => a.name === CONSTANTS.GAMIFICATION.ACHIEVEMENTS.FIRST_TRADE.NAME
  );
  if (
    !existing &&
    user.transactions.length >=
      CONSTANTS.GAMIFICATION.ACHIEVEMENTS.FIRST_TRADE.THRESHOLD
  ) {
    await awardAchievement(
      user.id,
      CONSTANTS.GAMIFICATION.ACHIEVEMENTS.FIRST_TRADE.NAME,
      CONSTANTS.GAMIFICATION.ACHIEVEMENTS.FIRST_TRADE.DESCRIPTION
    );
  }
};

const checkDiversifiedPortfolio = async (user: any) => {
  const existing = user.achievements.find(
    (a: any) =>
      a.name === CONSTANTS.GAMIFICATION.ACHIEVEMENTS.DIVERSIFIED_PORTFOLIO.NAME
  );
  if (
    !existing &&
    user.portfolios.length >=
      CONSTANTS.GAMIFICATION.ACHIEVEMENTS.DIVERSIFIED_PORTFOLIO.THRESHOLD
  ) {
    await awardAchievement(
      user.id,
      CONSTANTS.GAMIFICATION.ACHIEVEMENTS.DIVERSIFIED_PORTFOLIO.NAME,
      CONSTANTS.GAMIFICATION.ACHIEVEMENTS.DIVERSIFIED_PORTFOLIO.DESCRIPTION
    );
  }
};

const checkProfitMaker = async (user: any) => {
  const portfolio = await prisma.portfolio.findMany({
    where: { userId: user.id },
    include: { stock: true },
  });
  const totalGainLossPercent =
    portfolio.reduce((sum: number, item: any) => {
      const currentPrice = item.stock.ltp;
      const gainLoss =
        ((currentPrice - item.avgBuyPrice) / item.avgBuyPrice) * 100;
      return sum + gainLoss;
    }, 0) / (portfolio.length || 1);

  const levels = CONSTANTS.GAMIFICATION.ACHIEVEMENTS.PROFIT_MAKER.LEVELS;
  const existing = user.achievements.find(
    (a: any) => a.name === CONSTANTS.GAMIFICATION.ACHIEVEMENTS.PROFIT_MAKER.NAME
  );

  let level = "bronze";
  if (totalGainLossPercent >= levels.GOLD) level = "gold";
  else if (totalGainLossPercent >= levels.SILVER) level = "silver";
  else if (totalGainLossPercent >= levels.BRONZE) level = "bronze";
  else return;

  if (!existing || existing.level !== level) {
    await awardAchievement(
      user.id,
      CONSTANTS.GAMIFICATION.ACHIEVEMENTS.PROFIT_MAKER.NAME,
      CONSTANTS.GAMIFICATION.ACHIEVEMENTS.PROFIT_MAKER.DESCRIPTION,
      level
    );
  }
};

const checkVolumeTrader = async (user: any) => {
  const totalVolume = user.transactions.reduce(
    (sum: number, t: any) => sum + t.quantity,
    0
  );
  const levels = CONSTANTS.GAMIFICATION.ACHIEVEMENTS.VOLUME_TRADER.LEVELS;
  const existing = user.achievements.find(
    (a: any) =>
      a.name === CONSTANTS.GAMIFICATION.ACHIEVEMENTS.VOLUME_TRADER.NAME
  );

  let level = "bronze";
  if (totalVolume >= levels.GOLD) level = "gold";
  else if (totalVolume >= levels.SILVER) level = "silver";
  else if (totalVolume >= levels.BRONZE) level = "bronze";
  else return;

  if (!existing || existing.level !== level) {
    await awardAchievement(
      user.id,
      CONSTANTS.GAMIFICATION.ACHIEVEMENTS.VOLUME_TRADER.NAME,
      CONSTANTS.GAMIFICATION.ACHIEVEMENTS.VOLUME_TRADER.DESCRIPTION,
      level
    );
  }
};

const awardAchievement = async (
  userId: string,
  name: string,
  description: string,
  level: string = "bronze"
) => {
  const achievement = await prisma.achievement.upsert({
    where: { userId_name: { userId, name } },
    update: { level, earnedAt: new Date() },
    create: {
      userId,
      name,
      description,
      level,
    },
  });

  if (io) {
    io.to(userId).emit("achievementEarned", { userId, achievement });
  }
};
