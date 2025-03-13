import { Request, Response } from "express";
import { buyStock, sellStock } from "../services/tradeService";
import {
  createLimitOrder,
  getPendingOrders,
  cancelPendingOrder,
  getOrderBook,
} from "../services/orderService";
import { handleError } from "../utils/errorHandler";
import { ERRORS } from "../constants/errors";
import { User } from "@prisma/client";

export const buyStockController = async (req: Request, res: Response) => {
  const { symbol, quantity } = req.body;
  const userId = (req.user as User)?.id;

  if (!userId) {
    res.status(401).json({ error: "User not authenticated" });
    return;
  }

  try {
    const transaction = await buyStock({ userId, symbol, quantity });
    res.status(201).json(transaction);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    if (message === ERRORS.TRADE.STOCK_NOT_FOUND.message) {
      handleError(
        res,
        error,
        ERRORS.TRADE.STOCK_NOT_FOUND.message,
        ERRORS.TRADE.STOCK_NOT_FOUND.statusCode
      );
    } else if (message === ERRORS.TRADE.INSUFFICIENT_FUNDS.message) {
      handleError(
        res,
        error,
        ERRORS.TRADE.INSUFFICIENT_FUNDS.message,
        ERRORS.TRADE.INSUFFICIENT_FUNDS.statusCode
      );
    } else {
      handleError(
        res,
        error,
        ERRORS.TRADE.TRADE_FAILED.message,
        ERRORS.TRADE.TRADE_FAILED.statusCode
      );
    }
  }
};

export const sellStockController = async (req: Request, res: Response) => {
  const { symbol, quantity } = req.body;
  const userId = (req.user as User)?.id;

  if (!userId) {
    res.status(401).json({ error: "User not authenticated" });
    return;
  }

  try {
    const transaction = await sellStock({ userId, symbol, quantity });
    res.status(201).json(transaction);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    if (message === ERRORS.TRADE.STOCK_NOT_FOUND.message) {
      handleError(
        res,
        error,
        ERRORS.TRADE.STOCK_NOT_FOUND.message,
        ERRORS.TRADE.STOCK_NOT_FOUND.statusCode
      );
    } else if (message === "Insufficient stock quantity") {
      handleError(res, error, "Insufficient stock quantity", 400);
    } else {
      handleError(
        res,
        error,
        ERRORS.TRADE.TRADE_FAILED.message,
        ERRORS.TRADE.TRADE_FAILED.statusCode
      );
    }
  }
};

export const createLimitOrderController = async (
  req: Request,
  res: Response
) => {
  const { symbol, quantity, limitPrice, action } = req.body;
  const userId = (req.user as User)?.id;

  if (!userId) {
    res.status(401).json({ error: "User not authenticated" });
    return;
  }

  if (
    !symbol ||
    !quantity ||
    !limitPrice ||
    !action ||
    !["buy", "sell"].includes(action)
  ) {
    return handleError(res, null, "Invalid order details", 400);
  }

  try {
    const result = await createLimitOrder({
      userId,
      symbol,
      quantity,
      limitPrice,
      action,
    });
    res.status(201).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    if (message === ERRORS.TRADE.STOCK_NOT_FOUND.message) {
      handleError(
        res,
        error,
        ERRORS.TRADE.STOCK_NOT_FOUND.message,
        ERRORS.TRADE.STOCK_NOT_FOUND.statusCode
      );
    } else if (
      message === ERRORS.TRADE.INSUFFICIENT_FUNDS.message ||
      message === "Insufficient stock quantity"
    ) {
      handleError(res, error, message, 400);
    } else {
      handleError(res, error, "Failed to create limit order", 500);
    }
  }
};

export const getPendingOrdersController = async (
  req: Request,
  res: Response
) => {
  const userId = (req.user as User)?.id;

  if (!userId) {
    res.status(401).json({ error: "User not authenticated" });
    return;
  }

  try {
    const orders = await getPendingOrders(userId);
    res.status(200).json(orders);
  } catch (error) {
    handleError(
      res,
      error,
      "Failed to fetch pending orders",
      ERRORS.GENERIC.SERVER_ERROR.statusCode
    );
  }
};

export const cancelPendingOrderController = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;
  const userId = (req.user as User)?.id;

  if (!userId) {
    res.status(401).json({ error: "User not authenticated" });
    return;
  }

  if (!id) {
    return handleError(res, null, "Order ID required", 400);
  }

  try {
    const order = await cancelPendingOrder(userId, id);
    res.status(200).json({ message: "Order cancelled", order });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    if (message === "Order not found or already processed") {
      handleError(res, error, message, 404);
    } else {
      handleError(res, error, "Failed to cancel order", 500);
    }
  }
};

export const getOrderBookController = async (req: Request, res: Response) => {
  const { symbol } = req.params;
  const userId = (req.user as User)?.id;

  if (!userId) {
    res.status(401).json({ error: "User not authenticated" });
    return;
  }

  if (!symbol) {
    return handleError(res, null, "Stock symbol required", 400);
  }

  try {
    const orderBook = await getOrderBook(symbol);
    res.status(200).json(orderBook);
  } catch (error) {
    handleError(
      res,
      error,
      "Failed to fetch order book",
      ERRORS.GENERIC.SERVER_ERROR.statusCode
    );
  }
};
