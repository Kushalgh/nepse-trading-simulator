import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import "dotenv/config";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

app.use(express.json());

app.get("/stocks", (req, res) => {
  res.json([{ symbol: "NTC", price: 500 }]); // Mock data
});

io.on("connection", (socket) => {
  console.log("Client connected");
  socket.emit("stockUpdate", { symbol: "NTC", price: 500 });
});

const PORT = process.env.PORT;

if (!PORT) {
  throw new Error("PORT is not defined in the environment variables.");
}

httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
