import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import "dotenv/config";
import authRoutes from "./routes/auth";
import stockRoutes from "./routes/stockRoutes";
import passport from "./utils/passport";
import { startStockUpdates, flushLogsToDB } from "./services/stockService";
import * as cron from "node-cron";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

app.use(express.json());
app.use(passport.initialize());
app.use("/auth", authRoutes);
app.use("/stocks", stockRoutes);

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

const PORT: number = parseInt(process.env.PORT || "3000", 10);
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
