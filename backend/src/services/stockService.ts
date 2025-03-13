import { PrismaClient } from "@prisma/client";
import { createClient } from "redis";
import { Server } from "socket.io";
import * as cheerio from "cheerio";
import puppeteer, { Browser, HTTPRequest } from "puppeteer";
import { toNepalTime } from "../utils/helpers";
import { CONSTANTS } from "../constants/constants";
import { checkPendingOrders } from "./orderService";

const prisma = new PrismaClient();
const redisClient = createClient({ url: process.env.REDIS_URL });

redisClient.on("error", (err) => console.error("Redis error:", err));
redisClient.on("connect", () => console.log("Redis connected successfully"));
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

let browser: Browser | null = null;

const initializeBrowser = async () => {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--single-process",
      ],
      protocolTimeout: 120000,
    });
  }
  return browser;
};

const fetchStockDataWithRetry = async (
  io?: Server,
  retries = 3
): Promise<Stock[]> => {
  const browserInstance = await initializeBrowser();
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const page = await browserInstance.newPage();
      await page.setRequestInterception(true);
      page.on("request", (req: HTTPRequest) => {
        if (["image", "stylesheet", "font"].includes(req.resourceType())) {
          req.abort();
        } else {
          req.continue();
        }
      });

      await page.goto(CONSTANTS.STOCK.SCRAPE_URL, {
        waitUntil: "domcontentloaded",
        timeout: 120000,
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
        await page.close();
        return [];
      }

      const nstNow = toNepalTime(new Date());
      await prisma.$transaction(
        stocks.map((stock) =>
          prisma.stock.upsert({
            where: { symbol: stock.symbol },
            update: {
              ltp: stock.ltp,
              change: stock.change,
              high: stock.high,
              low: stock.low,
              open: stock.open,
              quantity: stock.quantity,
              trend: stock.trend,
              lastUpdated: nstNow,
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
          })
        )
      );

      for (const stock of stocks) {
        await redisClient.setEx(
          stock.symbol,
          CONSTANTS.REDIS.EXPIRATION,
          stock.ltp.toString()
        );
        if (io) {
          await redisClient.lPush(
            `stock:log:${stock.symbol}`,
            JSON.stringify({
              stockId: stock.symbol,
              price: stock.ltp,
              trend: stock.trend,
              timestamp: nstNow.toISOString(),
            })
          );
          await redisClient.expire(
            `stock:log:${stock.symbol}`,
            CONSTANTS.REDIS.STOCK_LOG_EXPIRATION
          );
          io.emit("stockUpdate", { stocks }); // Removed orderBook
        }
      }

      await page.close();
      return stocks;
    } catch (error) {
      console.error(`Scraping error (attempt ${attempt}):`, error);
      if (attempt === retries) return [];
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
  return [];
};

export const fetchStockData = async (io?: Server) => {
  const stocks = await fetchStockDataWithRetry(io);
  await checkPendingOrders(); // Check pending orders after price update
  return stocks;
};

export const flushLogsToDB = async () => {
  const stocks = await prisma.stock.findMany({
    select: { symbol: true, id: true },
  });
  const nstNow = toNepalTime(new Date());
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
            timestamp: new Date(parsedLog.timestamp),
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

export const getCachedStockPrice = async (symbol: string): Promise<number> => {
  const cached = await redisClient.get(symbol);
  if (cached) return parseFloat(cached);
  const stock = await prisma.stock.findUnique({
    where: { symbol },
    select: { ltp: true },
  });
  if (stock)
    await redisClient.setEx(
      symbol,
      CONSTANTS.REDIS.EXPIRATION,
      stock.ltp.toString()
    );
  return stock?.ltp || 0;
};

export const startStockUpdates = async (io: Server) => {
  await initializeBrowser();
  fetchStockData(io);
  setInterval(
    () => fetchStockData(io),
    parseInt(CONSTANTS.STOCK.UPDATE_INTERVAL, 10)
  );
};

export const shutdown = async () => {
  if (browser) await browser.close();
};
