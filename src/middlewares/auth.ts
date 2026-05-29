import type { Request, Response, NextFunction } from "express";
import { validarAccessToken } from "../libs/token.js";

export const auth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Sesion no iniciada" });
  }
  const data = validarAccessToken(token);
  if (!data.success) {
    return res.status(401).json({ message: "Token invalido" });
  }
  req.user = { id: data.result.idUsuario };
  next();
};
