import { Router, RequestHandler } from "express";
import { authMiddleware } from "../utils/middlewares/authMiddleware";
import { getPortfolioController } from "../controllers/portfolioController";

const router = Router();

router.get("/", authMiddleware as RequestHandler, getPortfolioController);

export default router;
