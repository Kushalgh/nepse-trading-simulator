import express from "express";
import passport from "../utils/passport";
import { signup, login } from "../controllers/authController";
import jwt from "jsonwebtoken";
import "dotenv/config";

const router = express.Router();
const JWT_SECRET: any = process.env.JWT_SECRET;

router.post("/signup", signup);
router.post("/login", login);
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req: any, res) => {
    const token = jwt.sign({ id: req.user.id }, JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token });
  }
);

export default router;
