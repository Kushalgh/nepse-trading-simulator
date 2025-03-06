# NEPSE Stock Trading Simulator - Project Scope

## Project Overview
**Objective**: Build a full-stack, real-time stock trading simulator for NEPSE (Nepal Stock Exchange) to showcase god-tier development skills.  
**Features**:  
- **Authentication**: JWT, OAuth (Google), 2FA for secure login.  
- **Real-Time Data**: WebSockets for live NEPSE stock prices, order book simulation, push notifications.  
- **Trading**: Virtual funds (NPR 1M), buy/sell, limit/stop orders, transaction fees, portfolio analytics.  
- **Leaderboard**: Rank users by portfolio value, gamification with achievements.  
- **Visualization**: Charts for stock trends and portfolio performance, AI trade suggestions.  
- **Mobile**: React Native app + PWA for cross-platform access.  
- **DevOps**: Docker, Kubernetes (AWS EKS), Nginx, CI/CD, monitoring (Prometheus/Grafana).  
**Tech Stack**: React, React Native, Node.js, Express, TypeScript, PostgreSQL, Redis, Socket.IO, Puppeteer, Cheerio, Prisma, etc.  
**Timeline**: Feb 24 - Aug 29, 2025 (24-27 weeks).

---

## Sprint 0: Authentication Setup
**Objective**: Build a robust backend, starting with authentication.  
**Authentication Features**:  
- JWT-based signup/login with email/password.  
- OAuth 2.0 (Google) for social login.  
- Two-Factor Authentication (2FA) with Google Authenticator.  
- Secure user data (hashed passwords, encrypted 2FA secrets).  
**Tech Stack**: Node.js, Express, TypeScript, PostgreSQL, Prisma, JWT, Passport.js, Speakeasy.  
**Status**: Completed integrating JWT auth , OAuth and 2FA 

---

## Sprint 1: Data Scraping (March 6, 2025)
**Objective**: Establish core backend functionality for stock data scraping and real-time updates.  
**Tasks Completed**:  
- **Database Setup**: Synced PostgreSQL (`trading_app`) with Prisma schema (`Stock` model) using `npx prisma db push` and generated Prisma Client (`npx prisma generate`).  
- **Stock Scraping**: Implemented scraping from MeroLagani using Puppeteer , replacing initial Axios approach due to dynamic content.  
- **Selector Fix**: Debugged and switched to `table.table tr` selector after `#ctl00_ContentPlaceHolder1_LiveMarket` failed.  
- **Data Storage**: Stored stock data in PostgreSQL via `prisma.stock.upsert` and cached `ltp` in Redis with 60s TTL.  
- **Real-Time Updates**: Set up WebSocket (`stockUpdate` event) every 5 seconds with stocks and mock order book.  
- **Logging Optimization**: Moved intensive `WebSocketLog` writes to Redis lists (`stock:log:${symbol}`, 1-hour TTL) from PostgreSQL to improve performance.  
- **Error Handling**: Added 3 retries with 2s delay and 60s timeout for Puppeteer scraping.  
- **Config**: Migrated key settings (`SCRAPE_URL`, `REDIS_URL`, `UPDATE_INTERVAL`) to `.env`.  

**Tech Stack**:  
- **Node.js**: Backend runtime for executing TypeScript code.  
- **TypeScript**: Type safety and tooling for `stockService.ts` and `app.ts`.  
- **Express**: Web framework for server setup and HTTP handling.  
- **PostgreSQL**: Persistent storage for stock data.  
- **Prisma**: ORM for database operations and schema management.  
- **Redis**: Caching (`ltp`) and logging (`stock:log:${symbol}`).  
- **Socket.IO**: Real-time WebSocket updates.  
- **Puppeteer**: Dynamic web scraping.  
- **Cheerio**: HTML parsing for stock data extraction.  
- **dotenv**: Environment variable management.  
- **Docker**: Local PostgreSQL and Redis instances (assumed).  

**Status**: Completed core scraping, storage, and real-time updates

---
