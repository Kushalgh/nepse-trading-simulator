import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import speakeasy from "speakeasy";
import { handleError } from "../utils/errorHandler";
import { CONSTANTS } from "../constants/constants";
import { ERRORS } from "../constants/errors";

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
        cashBalance: CONSTANTS.USER.CASH_BALANCE_DEFAULT,
        twoFactorSecret: secret.base32,
      },
    });
    const token = jwt.sign({ id: user.id }, CONSTANTS.AUTH.JWT_SECRET, {
      expiresIn: CONSTANTS.AUTH.JWT_EXPIRATION,
    });
    res.status(201).json({ token, twoFactorSecret: secret.base32 });
  } catch (error) {
    handleError(
      res,
      error,
      ERRORS.AUTH.USER_REGISTRATION_FAILED.message,
      ERRORS.AUTH.USER_REGISTRATION_FAILED.statusCode
    );
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password, twoFactorCode } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return handleError(
        res,
        null,
        ERRORS.AUTH.INVALID_CREDENTIALS.message,
        ERRORS.AUTH.INVALID_CREDENTIALS.statusCode
      );
    }

    if (user.twoFactorSecret) {
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token: twoFactorCode,
      });
      if (!verified) {
        return handleError(
          res,
          null,
          ERRORS.AUTH.INVALID_2FA_CODE.message,
          ERRORS.AUTH.INVALID_2FA_CODE.statusCode
        );
      }
    }

    const token = jwt.sign({ id: user.id }, CONSTANTS.AUTH.JWT_SECRET, {
      expiresIn: CONSTANTS.AUTH.JWT_EXPIRATION,
    });
    res.status(200).json({ token });
  } catch (error) {
    handleError(
      res,
      error,
      ERRORS.AUTH.LOGIN_FAILED.message,
      ERRORS.AUTH.LOGIN_FAILED.statusCode
    );
  }
};
