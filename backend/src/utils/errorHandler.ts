import { Response } from "express";

export const handleError = (
  res: Response,
  error: unknown,
  defaultMessage: string,
  statusCode: number = 500
) => {
  console.error(`${defaultMessage}:`, error);
  const message =
    error instanceof Error ? error.message : "An unexpected error occurred";
  res.status(statusCode).json({ error: message });
};
