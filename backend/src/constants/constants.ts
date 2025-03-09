export const CONSTANTS = {
  AUTH: {
    JWT_SECRET: process.env.JWT_SECRET || "",
    JWT_EXPIRATION: "1h",
  },
  USER: {
    CASH_BALANCE_DEFAULT: 1000000,
  },
  TRADE: {
    FEE_RATE: 0.004, // 0.4% NEPSE fee
  },
  REDIS: {
    EXPIRATION: 60, // Seconds
    STOCK_LOG_EXPIRATION: 3600, // Seconds
  },
  STOCK: {
    UPDATE_INTERVAL: process.env.UPDATE_INTERVAL || "5000", // Milliseconds
    SCRAPE_URL: process.env.SCRAPE_URL || "",
  },
  GOOGLE: {
    CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
    CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
    CALLBACK_URL: "http://localhost:3000/auth/google/callback",
  },
  SERVER: {
    PORT: parseInt(process.env.PORT || "3000", 10),
  },
} as const;
