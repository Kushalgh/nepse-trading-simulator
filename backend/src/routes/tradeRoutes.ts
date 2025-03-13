import { Router } from "express";
import {
  buyStockController,
  sellStockController,
  createLimitOrderController,
  getPendingOrdersController,
  cancelPendingOrderController,
  getOrderBookController,
} from "../controllers/tradeController";
import { authMiddleware } from "../utils/middlewares/authMiddleware";

const router = Router();

router.post("/buy", authMiddleware, buyStockController);
router.post("/sell", authMiddleware, sellStockController);

router.post("/limit", authMiddleware, createLimitOrderController);
router.get("/pending", authMiddleware, getPendingOrdersController);
router.delete("/pending/:id", authMiddleware, cancelPendingOrderController);
router.get("/order-book/:symbol", authMiddleware, getOrderBookController);

export default router;
