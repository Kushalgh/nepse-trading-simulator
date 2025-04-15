import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/authRoutes";
import stockRoutes from "./routes/stockRoutes";
import portfolioRoutes from "./routes/portfolioRoutes";
import tradeRoutes from "./routes/tradeRoutes";
import passport from "./utils/passport";
import cors from "cors";
import gamificationRoutes from "./routes/gamificationRoutes";
import { updateLeaderboard } from "./services/leaderboardService";
import { setIo as setAchievementIo } from "./services/achievementService";
import {
  startStockUpdates,
  flushLogsToDB,
  shutdown,
} from "./services/stockService";
import { setIo as setTradeIo } from "./services/tradeService";
import { setIo as setOrderIo } from "./services/orderService";
import * as cron from "node-cron";
import { CONSTANTS } from "./constants/constants";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });
app.use(cors());

app.use(express.json());
app.use(passport.initialize());

app.use("/auth", authRoutes);
app.use("/stocks", stockRoutes);
app.use("/portfolio", portfolioRoutes);
app.use("/trade", tradeRoutes);
app.use("/gamification", gamificationRoutes);

io.on("connection", (socket) => {
  console.log("Client connected");
  socket.on("disconnect", () => console.log("Client disconnected"));
  socket.on("error", (err) => console.error("WebSocket error:", err));
});

setTradeIo(io);
setOrderIo(io);
setAchievementIo(io);

async function initialize() {
  try {
    await startStockUpdates(io);
    cron.schedule("0 * * * *", flushLogsToDB);
    cron.schedule(
      CONSTANTS.GAMIFICATION.LEADERBOARD.UPDATE_INTERVAL,
      updateLeaderboard
    );
    await updateLeaderboard();
  } catch (err) {
    console.error("Failed to start stock updates:", err);
  }
}

initialize();

httpServer.listen(CONSTANTS.SERVER.PORT, () =>
  console.log(`Server running on port ${CONSTANTS.SERVER.PORT}`)
);

process.on("SIGTERM", async () => {
  console.log("Shutting down...");
  await shutdown();
  httpServer.close(() => process.exit(0));
});

process.on("SIGINT", async () => {
  console.log("Shutting down...");
  await shutdown();
  httpServer.close(() => process.exit(0));
});
