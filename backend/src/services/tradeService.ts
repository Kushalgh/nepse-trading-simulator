import { PrismaClient } from "@prisma/client";
import { getCachedStockPrice } from "./stockService";
import { toNepalTime } from "../utils/helpers";
import { CONSTANTS } from "../constants/constants";
import { ERRORS } from "../constants/errors";

const prisma = new PrismaClient();

export interface TradeRequest {
  userId: string;
  symbol: string;
  quantity: number;
}

export const buyStock = async ({ userId, symbol, quantity }: TradeRequest) => {
  const stockPrice = await getCachedStockPrice(symbol);
  if (!stockPrice) throw new Error(ERRORS.TRADE.STOCK_NOT_FOUND.message);

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
      where: { userId, stockId: symbol },
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
          stockId: symbol,
          quantity,
          avgBuyPrice: stockPrice,
        },
      });
    }

    const transaction = await tx.transaction.create({
      data: {
        userId,
        stockId: symbol,
        action: "buy",
        quantity,
        price: stockPrice,
        fee,
        totalAmount: totalCost,
        createdAt: toNepalTime(new Date()),
      },
    });

    return transaction;
  });

  return result;
};

export const sellStock = async ({ userId, symbol, quantity }: TradeRequest) => {
  const stockPrice = await getCachedStockPrice(symbol);
  if (!stockPrice) throw new Error(ERRORS.TRADE.STOCK_NOT_FOUND.message);

  const subtotal = stockPrice * quantity;
  const fee = subtotal * CONSTANTS.TRADE.FEE_RATE;
  const totalReceived = subtotal - fee;

  const portfolio = await prisma.portfolio.findFirst({
    where: { userId, stockId: symbol },
  });
  if (!portfolio || portfolio.quantity < quantity)
    throw new Error("Insufficient stock quantity");

  const result = await prisma.$transaction(async (tx) => {
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

    // Log transaction
    const transaction = await tx.transaction.create({
      data: {
        userId,
        stockId: symbol,
        action: "sell",
        quantity,
        price: stockPrice,
        fee,
        totalAmount: totalReceived,
        createdAt: toNepalTime(new Date()),
      },
    });

    return transaction;
  });

  return result;
};
