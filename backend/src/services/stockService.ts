import { PrismaClient } from "@prisma/client";
import { createClient } from "redis";
import { Server } from "socket.io";
import * as cheerio from "cheerio";
import puppeteer from "puppeteer";
import * as dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const redisClient = createClient({ url: process.env.REDIS_URL });

redisClient.on("error", (err) => console.error("Redis error:", err));
redisClient
  .connect()
  .catch((err) => console.error("Redis connect failed:", err));

export interface Stock {
  symbol: string;
  name: string;
  ltp: number;
  change: number;
  high: number;
  low: number;
  open: number;
  quantity: number;
  trend: string;
}

export interface Order {
  type: "buy" | "sell";
  quantity: number;
  price: number;
}

// Helper function to convert UTC to Nepal Standard Time (UTC+5:45)
const toNepalTime = (date: Date): Date => {
  const utcTime = date.getTime();
  const nstOffset = 5 * 60 + 45; // 5 hours 45 minutes in minutes
  const nstTime = utcTime + nstOffset * 60 * 1000; // Convert to milliseconds
  return new Date(nstTime);
};

const orderBook: { [symbol: string]: Order[] } = {};

const fetchStockDataWithRetry = async (
  io?: Server,
  retries = 3
): Promise<Stock[]> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto(process.env.SCRAPE_URL!, {
        waitUntil: "networkidle2",
        timeout: 60000,
      });

      const html = await page.content();
      const $ = cheerio.load(html);

      const stocks: Stock[] = [];

      $("table.table tr").each((i, element) => {
        if (i === 0) return;
        const cols = $(element).find("td");
        const symbol = $(cols[0]).text().trim();
        const ltp = parseFloat($(cols[1]).text().trim().replace(",", "")) || 0;
        const change = parseFloat($(cols[2]).text().trim()) || 0;
        const high = parseFloat($(cols[3]).text().trim().replace(",", "")) || 0;
        const low = parseFloat($(cols[4]).text().trim().replace(",", "")) || 0;
        const open = parseFloat($(cols[5]).text().trim().replace(",", "")) || 0;
        const quantity =
          parseInt($(cols[6]).text().trim().replace(",", ""), 10) || 0;

        if (symbol && ltp) {
          stocks.push({
            symbol,
            name: symbol,
            ltp,
            change,
            high,
            low,
            open,
            quantity,
            trend: change > 0 ? "up" : change < 0 ? "down" : "neutral",
          });
        }
      });

      if (stocks.length === 0) {
        await browser.close();
        return [];
      }

      const nstNow = toNepalTime(new Date()); // Current time in NST

      for (const stock of stocks) {
        const upsertedStock = await prisma.stock.upsert({
          where: { symbol: stock.symbol },
          update: {
            ltp: stock.ltp,
            change: stock.change,
            high: stock.high,
            low: stock.low,
            open: stock.open,
            quantity: stock.quantity,
            trend: stock.trend,
            lastUpdated: nstNow, // Adjusted to NST
          },
          create: {
            symbol: stock.symbol,
            name: stock.name,
            ltp: stock.ltp,
            change: stock.change,
            high: stock.high,
            low: stock.low,
            open: stock.open,
            quantity: stock.quantity,
            trend: stock.trend,
            lastUpdated: nstNow,
          },
        });
        await redisClient.setEx(stock.symbol, 60, stock.ltp.toString());
        const orders = updateOrderBook(stock.symbol);
        if (io) {
          await redisClient.lPush(
            `stock:log:${stock.symbol}`,
            JSON.stringify({
              stockId: upsertedStock.id,
              price: stock.ltp,
              trend: stock.trend,
              timestamp: nstNow.toISOString(), // Adjusted to NST
            })
          );
          await redisClient.expire(`stock:log:${stock.symbol}`, 3600);
          io.emit("stockUpdate", { stocks, orderBook });
        }
      }

      await browser.close();
      return stocks;
    } catch (error) {
      const err = error as any;
      console.error("Scraping error (attempt " + attempt + "):", {
        message: err.message,
        code: err.code || "Unknown error",
      });
      if (attempt === retries) return [];
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
  return [];
};

export const fetchStockData = async (io?: Server) => {
  return fetchStockDataWithRetry(io);
};

export const flushLogsToDB = async () => {
  const stocks = await prisma.stock.findMany({
    select: { symbol: true, id: true },
  });
  const nstNow = toNepalTime(new Date()); // Current time in NST
  for (const stock of stocks) {
    const logs = await redisClient.lRange(`stock:log:${stock.symbol}`, 0, -1);
    if (logs.length > 0) {
      await prisma.webSocketLog.createMany({
        data: logs.map((log) => {
          const parsedLog = JSON.parse(log);
          return {
            stockId: stock.id,
            price: parsedLog.price,
            trend: parsedLog.trend,
            timestamp: new Date(parsedLog.timestamp), // Already in NST from Redis
          };
        }),
      });
      await redisClient.del(`stock:log:${stock.symbol}`);
    }
  }
};

export const getAllStocks = async (): Promise<Stock[]> => {
  const stocks = await prisma.stock.findMany({
    select: {
      symbol: true,
      name: true,
      ltp: true,
      change: true,
      high: true,
      low: true,
      open: true,
      quantity: true,
      trend: true,
      lastUpdated: true,
    },
  });
  return stocks.map((stock) => ({
    symbol: stock.symbol,
    name: stock.name,
    ltp: stock.ltp,
    change: stock.change ?? 0,
    high: stock.high,
    low: stock.low,
    open: stock.open,
    quantity: stock.quantity,
    trend: stock.trend,
    // No adjustment needed here; already stored as NST
  }));
};

export const getStockBySymbol = async (
  symbol: string
): Promise<Stock | null> => {
  const cachedPrice = await redisClient.get(symbol);
  const stock = await prisma.stock.findUnique({
    where: { symbol },
    select: {
      symbol: true,
      name: true,
      ltp: true,
      change: true,
      high: true,
      low: true,
      open: true,
      quantity: true,
      trend: true,
      lastUpdated: true,
    },
  });
  if (!stock) return null;
  return {
    symbol: stock.symbol,
    name: stock.name,
    ltp: cachedPrice ? parseFloat(cachedPrice) : stock.ltp,
    change: stock.change ?? 0,
    high: stock.high,
    low: stock.low,
    open: stock.open,
    quantity: stock.quantity,
    trend: stock.trend,
  };
};

export const getOrderBook = (symbol: string): Order[] =>
  orderBook[symbol] || [];

export const getCachedStockPrice = async (symbol: string): Promise<number> => {
  const cached = await redisClient.get(symbol);
  if (cached) return parseFloat(cached);
  const stock = await prisma.stock.findUnique({
    where: { symbol },
    select: { ltp: true },
  });
  if (stock) await redisClient.setEx(symbol, 60, stock.ltp.toString());
  return stock?.ltp || 0;
};

export const updateOrderBook = (symbol: string): Order[] => {
  const buyOrder: Order = {
    type: "buy",
    quantity: Math.floor(Math.random() * 10) + 1,
    price: Math.floor(Math.random() * 1000),
  };
  const sellOrder: Order = {
    type: "sell",
    quantity: Math.floor(Math.random() * 10) + 1,
    price: Math.floor(Math.random() * 1000),
  };
  orderBook[symbol] = [buyOrder, sellOrder];
  return orderBook[symbol];
};

export const startStockUpdates = (io: Server) => {
  fetchStockData(io);
  setInterval(
    () => fetchStockData(io),
    parseInt(process.env.UPDATE_INTERVAL || "5000", 10)
  );
};
