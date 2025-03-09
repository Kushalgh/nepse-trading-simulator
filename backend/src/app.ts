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
import { startStockUpdates, flushLogsToDB } from "./services/stockService";
import * as cron from "node-cron";
import { CONSTANTS } from "./constants/constants";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

app.use(express.json());
app.use(passport.initialize());
app.use("/auth", authRoutes);
app.use("/stocks", stockRoutes);
app.post("/trade/buy", buyStockController);
app.post("/trade/sell", sellStockController);

io.on("connection", (socket) => {
  console.log("Client connected");
  socket.on("disconnect", () => console.log("Client disconnected"));
  socket.on("error", (err) => console.error("WebSocket error:", err));
});

async function initialize() {
  try {
    await startStockUpdates(io);
    cron.schedule("0 * * * *", flushLogsToDB);

    app.post("/trade/buy", async (req, res) => {
      await buyStockController(req, res);
      if (res.statusCode === 201) {
        io.emit("portfolioUpdate", {
          userId: req.body.userId,
          transaction: res.locals.transaction,
        });
      }
    });

    app.post("/trade/sell", async (req, res) => {
      await sellStockController(req, res);
      if (res.statusCode === 201) {
        io.emit("portfolioUpdate", {
          userId: req.body.userId,
          transaction: res.locals.transaction,
        });
      }
    });
  } catch (err) {
    console.error("Failed to start stock updates:", err);
  }
}

initialize();

httpServer.listen(CONSTANTS.SERVER.PORT, () =>
  console.log(`Server running on port ${CONSTANTS.SERVER.PORT}`)
);
