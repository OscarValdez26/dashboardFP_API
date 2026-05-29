import type { Request, Response } from "express";
import {
  deletePresupuesto,
  getPresupuestos,
  newPresupuesto,
  updatePresupuesto,
} from "../services/presupuestos.service.js";

export const obtenerPresupuestos = async (req: Request, res: Response) => {
  const data = await getPresupuestos(Number(req.user?.id));
  return res.status(200).json({ success: true, result: data });
};

export const nuevoPresupuesto = async (req: Request, res: Response) => {
  const data = req.body;
  const success = await newPresupuesto(Number(req.user?.id), data);
  return res
    .status(200)
    .json({ success: success, message: "Presupuesto creado" });
};

export const actualizarPresupuesto = async (req: Request, res: Response) => {
  const data = req.body;
  const success = await updatePresupuesto(
    Number(req.params.id),
    Number(req.user?.id),
    data,
  );
  return res
    .status(200)
    .json({ success: success, message: "Presupuesto actualizado" });
};

export const borrarPresupuesto = async (req: Request, res: Response) => {
  const success = await deletePresupuesto(
    Number(req.params.id),
    Number(req.user?.id),
  );
  return res
    .status(200)
    .json({ success: success, message: "Presupuesto eliminado" });
};
