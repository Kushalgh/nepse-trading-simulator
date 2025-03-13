import { PrismaClient, Transaction } from "@prisma/client";
import { Server } from "socket.io";
import { buyStock, sellStock } from "./tradeService";
import { getCachedStockPrice } from "./stockService";
import {
  toNepalTime,
  calculateStockMetrics,
  PortfolioStock,
} from "../utils/helpers";
import { CONSTANTS } from "../constants/constants";
import { ERRORS } from "../constants/errors";

const prisma = new PrismaClient();

export interface LimitOrderRequest {
  userId: string;
  symbol: string;
  quantity: number;
  limitPrice: number;
  action: "buy" | "sell";
}

let io: Server | null = null;

export const setIo = (socketIo: Server) => {
  io = socketIo;
};

export const createLimitOrder = async ({
  userId,
  symbol,
  quantity,
  limitPrice,
  action,
}: LimitOrderRequest) => {
  const stock = await prisma.stock.findUnique({ where: { symbol } });
  if (!stock) throw new Error(ERRORS.TRADE.STOCK_NOT_FOUND.message);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const totalCost =
    limitPrice * quantity + limitPrice * quantity * CONSTANTS.TRADE.FEE_RATE;

  if (action === "buy" && user.cashBalance < totalCost) {
    throw new Error(ERRORS.TRADE.INSUFFICIENT_FUNDS.message);
  } else if (action === "sell") {
    const portfolio = await prisma.portfolio.findFirst({
      where: { userId, stockId: stock.id },
    });
    if (!portfolio || portfolio.quantity < quantity) {
      throw new Error("Insufficient stock quantity");
    }
  }

  const order = await prisma.pendingOrder.create({
    data: {
      userId,
      stockId: stock.id,
      quantity,
      limitPrice,
      type: "limit",
      action,
      status: "pending",
      createdAt: toNepalTime(new Date()),
      expiresAt: toNepalTime(new Date(Date.now() + 24 * 60 * 60 * 1000)),
    },
  });

  const matchResult = await matchOrders(order);
  if (matchResult) {
    return matchResult;
  }

  if (io) {
    const notifyOrders = await prisma.pendingOrder.findMany({
      where: {
        stockId: stock.id,
        status: "pending",
        action: action === "buy" ? "sell" : "buy",
      },
      select: { userId: true },
    });
    notifyOrders.forEach((o) => {
      io?.to(o.userId).emit("orderOpportunity", {
        message: `New ${action} order for ${symbol} at ${limitPrice}—adjust your order?`,
        orderId: order.id,
      });
    });
    io?.to(userId).emit("pendingOrderCreated", { userId, order });
  }

  return order;
};

export const getPendingOrders = async (userId: string) => {
  return prisma.pendingOrder.findMany({
    where: { userId, status: "pending" },
    include: { stock: { select: { symbol: true } } },
  });
};

export const cancelPendingOrder = async (userId: string, orderId: string) => {
  const order = await prisma.pendingOrder.findUnique({
    where: { id: orderId },
  });
  if (!order || order.userId !== userId || order.status !== "pending") {
    throw new Error("Order not found or already processed");
  }

  const updatedOrder = await prisma.pendingOrder.update({
    where: { id: orderId },
    data: { status: "cancelled" },
  });

  io?.to(userId).emit("orderCancelled", { userId, order: updatedOrder });

  return updatedOrder;
};

export const matchOrders = async (
  newOrder: any
): Promise<Transaction | null> => {
  const oppositeAction = newOrder.action === "buy" ? "sell" : "buy";
  const priceCondition =
    newOrder.action === "buy"
      ? { lte: newOrder.limitPrice }
      : { gte: newOrder.limitPrice };

  const matchingOrders = await prisma.pendingOrder.findMany({
    where: {
      stockId: newOrder.stockId,
      action: oppositeAction,
      status: "pending",
      limitPrice: priceCondition,
      NOT: { userId: newOrder.userId },
    },
    orderBy: [
      { limitPrice: newOrder.action === "buy" ? "asc" : "desc" },
      { createdAt: "asc" },
    ],
  });

  if (matchingOrders.length === 0) return null;

  const match = matchingOrders[0];
  const tradeQuantity = Math.min(newOrder.quantity, match.quantity);
  const tradePrice = match.limitPrice;

  const result = await prisma.$transaction(async (tx) => {
    const buyerId = newOrder.action === "buy" ? newOrder.userId : match.userId;
    const sellerId =
      newOrder.action === "sell" ? newOrder.userId : match.userId;

    const subtotal = tradePrice * tradeQuantity;
    const fee = subtotal * CONSTANTS.TRADE.FEE_RATE;
    const totalCost = subtotal + fee;
    const totalReceived = subtotal - fee;

    const buyer = await tx.user.findUnique({ where: { id: buyerId } });
    if (!buyer || buyer.cashBalance < totalCost)
      throw new Error(ERRORS.TRADE.INSUFFICIENT_FUNDS.message);
    await tx.user.update({
      where: { id: buyerId },
      data: { cashBalance: buyer.cashBalance - totalCost },
    });

    const buyerPortfolio = await tx.portfolio.findFirst({
      where: { userId: buyerId, stockId: newOrder.stockId },
    });
    if (buyerPortfolio) {
      await tx.portfolio.update({
        where: { id: buyerPortfolio.id },
        data: {
          quantity: buyerPortfolio.quantity + tradeQuantity,
          avgBuyPrice: tradePrice,
        },
      });
    } else {
      await tx.portfolio.create({
        data: {
          userId: buyerId,
          stockId: newOrder.stockId,
          quantity: tradeQuantity,
          avgBuyPrice: tradePrice,
        },
      });
    }

    const sellerPortfolio = await tx.portfolio.findFirst({
      where: { userId: sellerId, stockId: newOrder.stockId },
    });
    if (!sellerPortfolio || sellerPortfolio.quantity < tradeQuantity)
      throw new Error("Insufficient stock quantity");
    const newSellerQuantity = sellerPortfolio.quantity - tradeQuantity;
    if (newSellerQuantity === 0) {
      await tx.portfolio.delete({ where: { id: sellerPortfolio.id } });
    } else {
      await tx.portfolio.update({
        where: { id: sellerPortfolio.id },
        data: { quantity: newSellerQuantity },
      });
    }
    await tx.user.update({
      where: { id: sellerId },
      data: { cashBalance: { increment: totalReceived } },
    });

    const transaction = await tx.transaction.create({
      data: {
        userId: buyerId,
        stockId: newOrder.stockId,
        action: "buy",
        quantity: tradeQuantity,
        price: tradePrice,
        fee,
        totalAmount: totalCost,
        createdAt: toNepalTime(new Date()),
      },
    });

    await tx.pendingOrder.update({
      where: { id: newOrder.id },
      data: { status: "executed", matchedOrderId: match.id },
    });
    await tx.pendingOrder.update({
      where: { id: match.id },
      data: { status: "executed", matchedOrderId: newOrder.id },
    });

    if (io) {
      const emitPortfolioUpdate = async (userId: string) => {
        const portfolio = await prisma.portfolio.findMany({
          where: { userId },
          include: { stock: { select: { symbol: true } } },
        });
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { cashBalance: true },
        });
        const portfolioData: PortfolioStock[] = await Promise.all(
          portfolio.map((p) => calculateStockMetrics(p, p.stock))
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

        io?.to(userId).emit("portfolioUpdate", {
          userId,
          portfolio: portfolioData,
          totalValue,
          totalGainLoss,
          totalInvested,
          cashBalance: user!.cashBalance,
        });
      };

      await emitPortfolioUpdate(buyerId);
      await emitPortfolioUpdate(sellerId);

      io
        ?.to(buyerId)
        .emit("orderMatched", { order: newOrder, match, transaction });
      io
        ?.to(sellerId)
        .emit("orderMatched", { order: match, match: newOrder, transaction });
    }

    return transaction;
  });

  return result;
};

export const checkPendingOrders = async () => {
  const pendingOrders = await prisma.pendingOrder.findMany({
    where: { status: "pending" },
    include: {
      stock: { select: { symbol: true } },
      user: { select: { id: true } },
    },
  });

  for (const order of pendingOrders) {
    const currentPrice = await getCachedStockPrice(order.stock.symbol);
    const shouldExecute =
      (order.action === "buy" && currentPrice <= order.limitPrice) ||
      (order.action === "sell" && currentPrice >= order.limitPrice);

    if (shouldExecute && (!order.expiresAt || new Date() <= order.expiresAt)) {
      try {
        const transaction =
          order.action === "buy"
            ? await buyStock({
                userId: order.userId,
                symbol: order.stock.symbol,
                quantity: order.quantity,
              })
            : await sellStock({
                userId: order.userId,
                symbol: order.stock.symbol,
                quantity: order.quantity,
              });

        await prisma.pendingOrder.update({
          where: { id: order.id },
          data: { status: "executed" },
        });

        io?.to(order.userId).emit("orderExecuted", {
          userId: order.userId,
          order: { ...order, status: "executed" },
          transaction,
        });
      } catch (error) {
        console.error(`Failed to execute order ${order.id}:`, error);
      }
    } else if (order.expiresAt && new Date() > order.expiresAt) {
      await prisma.pendingOrder.update({
        where: { id: order.id },
        data: { status: "cancelled" },
      });
      io?.to(order.userId).emit("orderCancelled", {
        userId: order.userId,
        order: { ...order, status: "cancelled" },
      });
    }
  }
};

export const getOrderBook = async (symbol: string) => {
  const stock = await prisma.stock.findUnique({ where: { symbol } });
  if (!stock) throw new Error(ERRORS.TRADE.STOCK_NOT_FOUND.message);

  const buyOrders = await prisma.pendingOrder.findMany({
    where: { stockId: stock.id, action: "buy", status: "pending" },
    select: { quantity: true, limitPrice: true },
    orderBy: { limitPrice: "desc" },
  });

  const sellOrders = await prisma.pendingOrder.findMany({
    where: { stockId: stock.id, action: "sell", status: "pending" },
    select: { quantity: true, limitPrice: true },
    orderBy: { limitPrice: "asc" },
  });

  return { symbol, buyOrders, sellOrders };
};
