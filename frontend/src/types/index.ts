export interface User {
  id: string;
  email: string;
  username: string;
}

export interface Stock {
  symbol: string;
  name: string;
  ltp: number;
  change?: number;
  high: number;
  low: number;
  open: number;
  quantity: number;
  trend: string;
}

export interface Transaction {
  id: string;
  userId: string;
  stockId: string;
  quantity: number;
  price: number;
  fee: number;
  totalAmount: number;
  action: "buy" | "sell";
  createdAt: string;
  stock: {
    symbol: string;
    name: string;
  };
}

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

export interface Portfolio {
  portfolio: PortfolioStock[];
  totalValue: number;
  totalGainLoss: number;
  totalInvested: number;
  cashBalance: number;
}

export interface PendingOrder {
  id: string;
  userId: string;
  stockId: string;
  quantity: number;
  limitPrice: number;
  type: string;
  action: "buy" | "sell";
  status: string;
  createdAt: string;
  expiresAt?: string;
  stock: {
    symbol: string;
  };
}

export interface OrderBook {
  symbol: string;
  buyOrders: {
    quantity: number;
    limitPrice: number;
  }[];
  sellOrders: {
    quantity: number;
    limitPrice: number;
  }[];
}

export interface Achievement {
  id: string;
  userId: string;
  name: string;
  description: string;
  level?: string;
  earnedAt: string;
}

export interface LeaderboardEntry {
  username: string;
  score: number;
  totalValue: number;
  profitPercent: number;
  tradeCount: number;
}

export interface PortfolioHistoryEntry {
  date: string;
  value: number;
}
