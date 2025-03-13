import { Request, Response, NextFunction } from "express";
import { PrismaClient, User } from "@prisma/client";
import { handleError } from "../utils/errorHandler";
import { ERRORS } from "../constants/errors";
import { calculateStockMetrics, PortfolioStock } from "../utils/helpers";

const prisma = new PrismaClient();

interface PortfolioResponse {
  portfolio: PortfolioStock[];
  totalValue: number;
  totalGainLoss: number;
  totalInvested: number;
  cashBalance: number;
}
interface AuthenticatedRequest extends Request {
  user?: User;
}
export const getPortfolioController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ error: ERRORS.AUTH.INVALID_CREDENTIALS.message });
    return;
  }

  try {
    const [user, portfolio] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { cashBalance: true },
      }),
      prisma.portfolio.findMany({
        where: { userId },
        include: {
          stock: {
            select: { symbol: true },
          },
        },
      }),
    ]);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (!portfolio || portfolio.length === 0) {
      const response: PortfolioResponse = {
        portfolio: [],
        totalValue: 0,
        totalGainLoss: 0,
        totalInvested: 0,
        cashBalance: user.cashBalance,
      };
      res.status(200).json(response);
      return;
    }

    const portfolioData = await Promise.all(
      portfolio.map((item) => {
        if (!item.stock) {
          throw new Error(`Stock data missing for portfolio item ${item.id}`);
        }
        return calculateStockMetrics(item, item.stock);
      })
    );

    // Aggregate totals
    const totalValue = portfolioData.reduce(
      (sum, item) => sum + item.currentValue,
      0
    );
    const totalGainLoss = portfolioData.reduce(
      (sum, item) => sum + item.gainLoss,
      0
    );
    const totalInvested = portfolioData.reduce(
      (sum, item) => sum + item.investedValue,
      0
    );

    const response: PortfolioResponse = {
      portfolio: portfolioData,
      totalValue,
      totalGainLoss,
      totalInvested,
      cashBalance: user.cashBalance,
    };

    res.status(200).json(response);
  } catch (error) {
    handleError(
      res,
      error,
      "Failed to fetch portfolio",
      ERRORS.GENERIC.SERVER_ERROR.statusCode
    );
  } finally {
    await prisma.$disconnect();
  }
};
