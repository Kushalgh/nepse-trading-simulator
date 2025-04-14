export const CONSTANTS = {
  AUTH: {
    JWT_SECRET: process.env.JWT_SECRET || "",
    JWT_EXPIRATION: "1h",
  },
  USER: {
    CASH_BALANCE_DEFAULT: 1000000,
  },
  TRADE: {
    FEE_RATE: 0.004,
  },
  REDIS: {
    EXPIRATION: 60,
    STOCK_LOG_EXPIRATION: 3600,
  },
  STOCK: {
    UPDATE_INTERVAL: process.env.UPDATE_INTERVAL || "5000",
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
  GAMIFICATION: {
    ACHIEVEMENTS: {
      FIRST_TRADE: {
        NAME: "First Trade",
        DESCRIPTION: "Complete your first successful trade",
        THRESHOLD: 1,
      },
      DIVERSIFIED_PORTFOLIO: {
        NAME: "Diversified Portfolio",
        DESCRIPTION: "Hold at least 5 different stocks",
        THRESHOLD: 5,
      },
      PROFIT_MAKER: {
        NAME: "Profit Maker",
        DESCRIPTION: "Achieve a profit of 10% or more",
        THRESHOLD: 10,
        LEVELS: {
          BRONZE: 10,
          SILVER: 25,
          GOLD: 50,
        },
      },
      VOLUME_TRADER: {
        NAME: "Volume Trader",
        DESCRIPTION: "Trade a total volume of 1000 shares",
        THRESHOLD: 1000,
        LEVELS: {
          BRONZE: 1000,
          SILVER: 5000,
          GOLD: 10000,
        },
      },
    },
    LEADERBOARD: {
      UPDATE_INTERVAL: "0 0 * * *",
      MESSAGES: {
        REDIS_KEY: "leaderboard",
        UPDATE_FAILED: "Failed to update leaderboard:",
        FETCH_FAILED: "Failed to fetch leaderboard:",
      },
    },
  },
} as const;
