// app.ts
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/authRoutes";
import stockRoutes from "./routes/stockRoutes";
import {
  buyStockController,
  sellStockController,
} from "./controllers/tradeController";
import passport from "./utils/passport";
import {
  startStockUpdates,
  flushLogsToDB,
  shutdown,
} from "./services/stockService";
import * as cron from "node-cron";
import { CONSTANTS } from "./constants/constants";
import { authMiddleware } from "../src/utils/middlewares/authMiddleware";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

app.use(express.json());
app.use(passport.initialize());

app.use("/auth", authRoutes);
app.use("/stocks", stockRoutes);

app.post("/trade/buy", authMiddleware, buyStockController);
app.post("/trade/sell", authMiddleware, sellStockController);

io.on("connection", (socket) => {
  console.log("Client connected");
  socket.on("disconnect", () => console.log("Client disconnected"));
  socket.on("error", (err) => console.error("WebSocket error:", err));
});

async function initialize() {
  try {
    await startStockUpdates(io);
    cron.schedule("0 * * * *", flushLogsToDB);
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
