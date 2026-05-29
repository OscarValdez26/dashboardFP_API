import type { Request, Response, NextFunction } from "express";

export const validarJSON =
  (schema: any) => (req: Request, res: Response, next: NextFunction) => {
    const resultado = schema.safeParse(req.body);
    if (!resultado.success) {
      return res.status(400).json({
        message: "Datos invalidos",
        errores: resultado.error.flatten(),
      });
    }
    req.body = resultado.data;
    next();
  };
