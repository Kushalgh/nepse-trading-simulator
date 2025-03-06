import express from "express";
import {
  getAllStocksController,
  getStockBySymbolController,
  getOrderBookController,
} from "../controllers/stockController";

const router = express.Router();

router.get("/", getAllStocksController);
router.get("/:symbol", getStockBySymbolController);
router.get("/:symbol/order-book", getOrderBookController);

export default router;
