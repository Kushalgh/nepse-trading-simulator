import { getCachedStockPrice } from "../services/stockService";

export interface PortfolioStock {
  symbol: string;
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
  currentValue: number;
  gainLoss: number;
  gainLossPercent: number;
  investedValue: number;
}

export const calculateStockMetrics = async (
  portfolioItem: any,
  stock: any
): Promise<PortfolioStock> => {
  const currentPrice = await getCachedStockPrice(stock.symbol);
  const quantity = portfolioItem.quantity;
  const avgBuyPrice = portfolioItem.avgBuyPrice;
  const currentValue = quantity * currentPrice;
  const investedValue = quantity * avgBuyPrice;
  const gainLoss = currentValue - investedValue;
  const gainLossPercent =
    avgBuyPrice > 0 ? (gainLoss / investedValue) * 100 : 0;

  return {
    symbol: stock.symbol,
    quantity,
    avgBuyPrice,
    currentPrice,
    currentValue,
    gainLoss,
    gainLossPercent,
    investedValue,
  };
};

export const toNepalTime = (date: Date): Date => {
  const utcTime = date.getTime();
  const nstOffset = 5 * 60 + 45; // 5 hours 45 minutes in minutes
  const nstTime = utcTime + nstOffset * 60 * 1000;
  return new Date(nstTime);
};
