import {
  deleteRegla,
  getReglas,
  newRegla,
} from "../services/reglas.service.js";
import type { Request, Response } from "express";

export const obtenerReglas = async (req: Request, res: Response) => {
  const reglas = await getReglas(Number(req.user!.id));
  return res.status(200).json({ success: true, result: reglas });
};

export const nuevaRegla = async (req: Request, res: Response) => {
  const nuevaRegla = req.body;
  const regla = await newRegla(Number(req.user!.id), nuevaRegla);
  return res.status(200).json({ message: "Regla creada", result: regla });
};

export const borrarRegla = async (req: Request, res: Response) => {
  await deleteRegla(Number(req.params.id));
  return res.status(200).json({ message: "Regla eliminada" });
};
