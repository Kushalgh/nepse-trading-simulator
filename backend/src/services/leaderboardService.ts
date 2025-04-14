import { PrismaClient } from "@prisma/client";
import { createClient } from "redis";
import { CONSTANTS } from "../constants/constants";

const prisma = new PrismaClient();
const redisClient = createClient({ url: process.env.REDIS_URL });

redisClient
  .connect()
  .catch((err) => console.error("Redis connect failed:", err));

export const updateLeaderboard = async () => {
  try {
    const users = await prisma.user.findMany({
      include: { portfolios: { include: { stock: true } }, transactions: true },
    });

    const leaderboard = await Promise.all(
      users.map(async (user) => {
        const portfolioValue = user.portfolios.reduce((sum, p) => {
          return sum + p.quantity * p.stock.ltp;
        }, 0);
        const totalValue = portfolioValue + user.cashBalance;
        const profitPercent = user.transactions.length
          ? (user.portfolios.reduce((sum, p) => {
              const gain = (p.stock.ltp - p.avgBuyPrice) * p.quantity;
              return sum + gain;
            }, 0) /
              (portfolioValue || 1)) *
            100
          : 0;
        const tradeCount = user.transactions.length;

        const score = totalValue * 0.5 + profitPercent * 100 + tradeCount * 10;

        await prisma.user.update({
          where: { id: user.id },
          data: { leaderboardScore: score },
        });

        return {
          username: user.username,
          score,
          totalValue,
          profitPercent,
          tradeCount,
        };
      })
    );

    const sortedLeaderboard = leaderboard.sort((a, b) => b.score - a.score);
    await redisClient.setEx(
      CONSTANTS.GAMIFICATION.LEADERBOARD.MESSAGES.REDIS_KEY,
      24 * 60 * 60,
      JSON.stringify(sortedLeaderboard)
    );
  } catch (error) {
    console.error(
      CONSTANTS.GAMIFICATION.LEADERBOARD.MESSAGES.UPDATE_FAILED,
      error
    );
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

export const getLeaderboard = async () => {
  try {
    const cached = await redisClient.get(
      CONSTANTS.GAMIFICATION.LEADERBOARD.MESSAGES.REDIS_KEY
    );
    if (cached) return JSON.parse(cached);

    await updateLeaderboard();
    const leaderboard = await redisClient.get(
      CONSTANTS.GAMIFICATION.LEADERBOARD.MESSAGES.REDIS_KEY
    );
    return JSON.parse(leaderboard || "[]");
  } catch (error) {
    console.error(
      CONSTANTS.GAMIFICATION.LEADERBOARD.MESSAGES.FETCH_FAILED,
      error
    );
    throw error;
  }
};
