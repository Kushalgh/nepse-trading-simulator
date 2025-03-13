export const ERRORS = {
  AUTH: {
    USER_REGISTRATION_FAILED: {
      message: "User registration failed",
      statusCode: 400,
    },
    INVALID_CREDENTIALS: {
      message: "Invalid credentials",
      statusCode: 401,
    },
    INVALID_2FA_CODE: {
      message: "Invalid 2FA code",
      statusCode: 401,
    },
    LOGIN_FAILED: {
      message: "Login failed",
      statusCode: 500,
    },
  },
  STOCK: {
    FETCH_STOCKS_FAILED: {
      message: "Failed to fetch stocks",
      statusCode: 500,
    },
    STOCK_NOT_FOUND: {
      message: "Stock not found",
      statusCode: 404,
    },
    FETCH_STOCK_FAILED: {
      message: "Failed to fetch stock",
      statusCode: 500,
    },
    FETCH_ORDER_BOOK_FAILED: {
      message: "Failed to fetch order book",
      statusCode: 500,
    },
    ORDER_BOOK_NOT_FOUND: {
      message: "Order book not found",
      statusCode: 404,
    },
  },
  TRADE: {
    STOCK_NOT_FOUND: {
      message: "Stock not found",
      statusCode: 404,
    },
    INSUFFICIENT_FUNDS: {
      message: "Insufficient funds",
      statusCode: 400,
    },
    TRADE_FAILED: {
      message: "Failed to process trade",
      statusCode: 500,
    },
  },
  GENERIC: {
    SERVER_ERROR: {
      message: "Internal server error",
      statusCode: 500,
    },
  },
} as const;
