import { Request, Response } from "express";
import {
  getAllStocks,
  getStockBySymbol,
  getOrderBook,
} from "../services/stockService";

export const getAllStocksController = async (req: Request, res: Response) => {
  try {
    const stocks = await getAllStocks();
    res.json(stocks);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stocks" });
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
      res.status(404).json({ error: "Stock not found" });
    } else {
      res.json(stock);
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stock" });
  }
};

export const getOrderBookController = async (req: Request, res: Response) => {
  const { symbol } = req.params;
  try {
    const orders = getOrderBook(symbol);
    if (!orders.length) {
      res.status(404).json({ error: "Order book not found" });
    } else {
      res.json(orders);
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch order book" });
  }
};
