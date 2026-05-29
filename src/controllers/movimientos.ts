import {
  getMovimientos,
  newMovimiento,
  movimientosRecientes,
  getGastos,
  getPeriodo,
} from "../services/movimientos.service.js";
import type { Request, Response } from "express";

export const obtenerMovimientos = async (req: Request, res: Response) => {
  const movimientos = await getMovimientos(Number(req.user!.id));
  return res.status(200).json(movimientos);
};

export const nuevoMovimiento = async (req: Request, res: Response) => {
  const nuevoMovimiento = req.body;
  const result = await newMovimiento(Number(req.user!.id), nuevoMovimiento);
  return res
    .status(200)
    .json({ message: "Transaccion realizada", result: result });
};

export const ultimosMovimientos = async (req: Request, res: Response) => {
  const result = await movimientosRecientes(Number(req.user!.id));
  return res.status(200).json({ success: true, result: result });
};

export const movimientosPeriodo = async (req: Request, res: Response) => {
  const { inicio, final } = req.body;
  const fechaInicio = new Date(inicio);
  const fechaFinal = new Date(final);
  const result = await getPeriodo(
    Number(req.user?.id),
    fechaInicio,
    fechaFinal,
  );
  return res.status(200).json({ success: true, result: result });
};

export const gastosMes = async (req: Request, res: Response) => {
  const result = await getGastos(Number(req.user?.id));
  return res.status(200).json({ success: true, result: result });
};
