import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import speakeasy from "speakeasy";
import "dotenv/config";

const JWT_SECRET = process.env.JWT_SECRET || "";
const prisma = new PrismaClient();

export const signup = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const secret = speakeasy.generateSecret({ length: 20 });

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        username,
        virtualFunds: 1000000,
        twoFactorSecret: secret.base32,
      },
    });
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1hr" });
    res.status(201).json({ token, twoFactorSecret: secret.base32 });
  } catch (error) {
    res.status(400).json({ error: "User registration failed" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password, twoFactorCode } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    if (user.twoFactorSecret) {
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token: twoFactorCode,
      });
      if (!verified) {
        res.status(401).json({ error: "Invalid 2FA code" });
        return;
      }
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });
    res.status(200).json({ token });
    return;
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
    return;
  }
};
