import { PrismaClient } from "@prisma/client";
import { Server } from "socket.io";
import { getCachedStockPrice } from "./stockService";
import {
  toNepalTime,
  calculateStockMetrics,
  PortfolioStock,
} from "../utils/helpers";
import { CONSTANTS } from "../constants/constants";
import { ERRORS } from "../constants/errors";

const prisma = new PrismaClient();

export interface TradeRequest {
  userId: string;
  symbol: string;
  quantity: number;
}

let io: Server | null = null;

export const setIo = (socketIo: Server) => {
  io = socketIo;
};

export const buyStock = async ({ userId, symbol, quantity }: TradeRequest) => {
  const stockPrice = await getCachedStockPrice(symbol);
  if (!stockPrice) throw new Error(ERRORS.TRADE.STOCK_NOT_FOUND.message);

  const stock = await prisma.stock.findUnique({ where: { symbol } });
  if (!stock) throw new Error(ERRORS.TRADE.STOCK_NOT_FOUND.message);

  const subtotal = stockPrice * quantity;
  const fee = subtotal * CONSTANTS.TRADE.FEE_RATE;
  const totalCost = subtotal + fee;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.cashBalance < totalCost)
    throw new Error(ERRORS.TRADE.INSUFFICIENT_FUNDS.message);

  const result = await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { cashBalance: user.cashBalance - totalCost },
    });

    const portfolio = await tx.portfolio.findFirst({
      where: { userId, stockId: stock.id },
    });
    if (portfolio) {
      const newQuantity = portfolio.quantity + quantity;
      const newAvgBuyPrice =
        (portfolio.avgBuyPrice * portfolio.quantity + subtotal) / newQuantity;
      await tx.portfolio.update({
        where: { id: portfolio.id },
        data: { quantity: newQuantity, avgBuyPrice: newAvgBuyPrice },
      });
    } else {
      await tx.portfolio.create({
        data: {
          userId,
          stockId: stock.id,
          quantity,
          avgBuyPrice: stockPrice,
        },
      });
    }

    const transaction = await tx.transaction.create({
      data: {
        userId,
        stockId: stock.id,
        action: "buy",
        quantity,
        price: stockPrice,
        fee,
        totalAmount: totalCost,
        createdAt: toNepalTime(new Date()),
      },
    });

    if (io) {
      const updatedPortfolio = await prisma.portfolio.findMany({
        where: { userId },
        include: { stock: { select: { symbol: true } } },
      });
      const updatedUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { cashBalance: true },
      });

      const portfolioData: PortfolioStock[] = await Promise.all(
        updatedPortfolio.map((p) => calculateStockMetrics(p, p.stock))
      );

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

      io.to(userId).emit("portfolioUpdate", {
        userId,
        portfolio: portfolioData,
        totalValue,
        totalGainLoss,
        totalInvested,
        cashBalance: updatedUser!.cashBalance,
      });
    }

    return transaction;
  });

  return result;
};

export const sellStock = async ({ userId, symbol, quantity }: TradeRequest) => {
  const stockPrice = await getCachedStockPrice(symbol);
  if (!stockPrice) throw new Error(ERRORS.TRADE.STOCK_NOT_FOUND.message);

  const stock = await prisma.stock.findUnique({ where: { symbol } });
  if (!stock) throw new Error(ERRORS.TRADE.STOCK_NOT_FOUND.message);

  const subtotal = stockPrice * quantity;
  const fee = subtotal * CONSTANTS.TRADE.FEE_RATE;
  const totalReceived = subtotal - fee;

  const result = await prisma.$transaction(async (tx) => {
    const portfolio = await tx.portfolio.findFirst({
      where: { userId, stockId: stock.id },
    });
    if (!portfolio || portfolio.quantity < quantity)
      throw new Error("Insufficient stock quantity");

    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    await tx.user.update({
      where: { id: userId },
      data: { cashBalance: user.cashBalance + totalReceived },
    });

    const newQuantity = portfolio.quantity - quantity;
    if (newQuantity === 0) {
      await tx.portfolio.delete({ where: { id: portfolio.id } });
    } else {
      await tx.portfolio.update({
        where: { id: portfolio.id },
        data: { quantity: newQuantity },
      });
    }

    const transaction = await tx.transaction.create({
      data: {
        userId,
        stockId: stock.id,
        action: "sell",
        quantity,
        price: stockPrice,
        fee,
        totalAmount: totalReceived,
        createdAt: toNepalTime(new Date()),
      },
    });

    if (io) {
      const updatedPortfolio = await prisma.portfolio.findMany({
        where: { userId },
        include: { stock: { select: { symbol: true } } },
      });
      const updatedUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { cashBalance: true },
      });

      const portfolioData: PortfolioStock[] = await Promise.all(
        updatedPortfolio.map((p) => calculateStockMetrics(p, p.stock))
      );

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

      io.to(userId).emit("portfolioUpdate", {
        userId,
        portfolio: portfolioData,
        totalValue,
        totalGainLoss,
        totalInvested,
        cashBalance: updatedUser!.cashBalance,
      });
    }

    return transaction;
  });

  return result;
};
