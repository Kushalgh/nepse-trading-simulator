import { Request, Response } from "express";
import { buyStock, sellStock, TradeRequest } from "../services/tradeService";
import { handleError } from "../utils/errorHandler";
import { ERRORS } from "../constants/errors";

export const buyStockController = async (req: Request, res: Response) => {
  const { symbol, quantity } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ error: "User not authenticated" });
    return;
  }

  try {
    const transaction = await buyStock({ userId, symbol, quantity });
    res.locals.transaction = transaction;
    res.status(201).json(transaction);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
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
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ error: "User not authenticated" });
    return;
  }

  try {
    const transaction = await sellStock({ userId, symbol, quantity });
    res.locals.transaction = transaction;
    res.status(201).json(transaction);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
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
