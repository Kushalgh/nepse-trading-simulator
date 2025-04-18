import { Request, Response } from "express";
import { getAllStocks, getStockBySymbol } from "../services/stockService";
import { getOrderBook } from "../services/orderService";
import { handleError } from "../utils/errorHandler";
import { ERRORS } from "../constants/errors";

export const getAllStocksController = async (req: Request, res: Response) => {
  try {
    const stocks = await getAllStocks();
    res.json(stocks);
  } catch (error) {
    handleError(
      res,
      error,
      ERRORS.STOCK.FETCH_STOCKS_FAILED.message,
      ERRORS.STOCK.FETCH_STOCKS_FAILED.statusCode
    );
  }
};

export const getStockBySymbolController = async (
  req: Request,
  res: Response
) => {
  const { symbol } = req.params;
  try {
    const stock = await getStockBySymbol(symbol);
    if (!stock) {
      return handleError(
        res,
        null,
        ERRORS.STOCK.STOCK_NOT_FOUND.message,
        ERRORS.STOCK.STOCK_NOT_FOUND.statusCode
      );
    }
    res.json(stock);
  } catch (error) {
    handleError(
      res,
      error,
      ERRORS.STOCK.FETCH_STOCK_FAILED.message,
      ERRORS.STOCK.FETCH_STOCK_FAILED.statusCode
    );
  }
};

export const getOrderBookController = async (req: Request, res: Response) => {
  const { symbol } = req.params;
  try {
    const orderBook = await getOrderBook(symbol);
    if (!orderBook.buyOrders.length && !orderBook.sellOrders.length) {
      return handleError(
        res,
        null,
        ERRORS.STOCK.ORDER_BOOK_NOT_FOUND.message,
        ERRORS.STOCK.ORDER_BOOK_NOT_FOUND.statusCode
      );
    }
    res.json(orderBook);
  } catch (error) {
    handleError(
      res,
      error,
      ERRORS.STOCK.FETCH_ORDER_BOOK_FAILED.message,
      ERRORS.STOCK.FETCH_ORDER_BOOK_FAILED.statusCode
    );
  }
};
