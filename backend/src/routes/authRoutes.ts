import express from "express";
import passport from "../utils/passport";
import { signup, login } from "../controllers/authController";
import jwt from "jsonwebtoken";
import { CONSTANTS } from "../constants/constants";

const router = express.Router();

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
    const token = jwt.sign({ id: req.user.id }, CONSTANTS.AUTH.JWT_SECRET, {
      expiresIn: CONSTANTS.AUTH.JWT_EXPIRATION,
    });
    res.json({ token });
  }
);

export default router;
