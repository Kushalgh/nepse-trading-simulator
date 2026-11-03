# NEPSE Trading Simulator

**A virtual stock trading platform for the Nepal Stock Exchange (NEPSE).**

Practice investing, explore the Nepalese stock market, build virtual portfolios, and test trading strategies — all without risking real money.

The NEPSE Trading Simulator is a full-stack web application that replicates key aspects of stock market trading. Users receive virtual capital, access market data, execute simulated trades, and track their portfolio performance in a realistic trading environment.

---

## Features

### Authentication & Security
- User registration and login with JWT authentication.
- Google OAuth 2.0 integration.
- Two-factor authentication (2FA) using an authenticator app.
- Secure password hashing and protected routes.

### Market Data
- Automated NEPSE stock data scraping from MeroLagani.
- Coverage of approximately 370 listed stocks.
- Real-time stock price updates using WebSockets.
- Simulated order book data.
- Redis caching for frequently accessed market data.

### Virtual Trading
- NPR 1,000,000 in virtual starting capital.
- Simulated stock buying and selling.
- Transaction fee calculation.
- Cash balance validation.
- Portfolio and transaction tracking.

### Portfolio Management
- Track stock holdings and available virtual balance.
- Monitor portfolio value and performance.
- Review transaction history.
- Experiment with different investment strategies.

---

## Tech Stack

| Category | Technologies |
|---|---|
| Frontend | React, TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js, TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Caching | Redis |
| Real-time Communication | Socket.IO |
| Authentication | JWT, Google OAuth 2.0, 2FA |
| Web Scraping | Puppeteer, Cheerio |
| Development | Docker, Git |

---

## Architecture

The application follows a client-server architecture.

```mermaid
flowchart TD
    A[React Frontend] <-->|REST API| B[Express Backend]
    A <-->|Socket.IO| B
    B --> C[PostgreSQL]
    B --> D[Redis Cache]
    E[MeroLagani] --> F[Data Scraper]
    F --> B
    B --> G[Authentication & Trading Services]
    G --> C
    G --> D
```

### How It Works

1. Market data is collected from MeroLagani using automated scraping.
2. Stock information is persisted in PostgreSQL.
3. Redis caches frequently accessed market prices.
4. Socket.IO broadcasts market updates to connected clients.
5. Users execute simulated trades through backend APIs.
6. Portfolio balances, holdings, and transactions are maintained in PostgreSQL.

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- PostgreSQL
- Redis
- Git
- npm

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/Kushalgh/nepse-trading-simulator.git

cd nepse-trading-simulator
```

**2. Configure environment variables**

Create the required `.env` files for the frontend and backend.

Example backend configuration:

```env
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/trading_app
REDIS_URL=redis://localhost:6379

JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

SCRAPE_URL=your_market_data_source
UPDATE_INTERVAL=5000
```

**3. Install dependencies**

Navigate into the backend and frontend directories and install their dependencies:

```bash
cd backend
npm install

cd ../frontend
npm install
```

**4. Set up the database**

From the backend directory:

```bash
npx prisma generate
npx prisma db push
```

**5. Start the application**

Run the backend and frontend development servers in separate terminals using their respective development scripts.

Check each package's `package.json` for the available scripts.

---

## Disclaimer

This project is an educational stock market simulator.

- No real money is involved.
- Trades are simulated and do not execute on the actual Nepal Stock Exchange.
- Market data availability and accuracy depend on the external data source.
- This application is not affiliated with or endorsed by the Nepal Stock Exchange or MeroLagani.

---

## Project Goals

The goal of this project is to provide an accessible environment for learning about the Nepalese stock market while exploring the engineering challenges behind financial applications, including:

- Real-time data processing.
- Backend architecture and API development.
- Financial transaction logic.
- Database design and optimization.
- Caching and WebSocket communication.
- Authentication and application security.

---

## Author

**Kushal Ghimire**

- GitHub: [@Kushalgh](https://github.com/Kushalgh)

---

*Built with curiosity, code, and an interest in the Nepalese stock market.*
