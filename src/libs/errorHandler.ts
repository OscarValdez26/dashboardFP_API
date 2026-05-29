import type { Request, Response, NextFunction } from "express";
import { AppError } from "./appError.js";

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  if (err instanceof Error) {
    return res.status(500).json({
      message: err.message,
    });
  }
  console.error(err);
  return res.status(500).json({ message: "Error en el servidor" });
};
