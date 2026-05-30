import type { Request, Response } from "express";
import {
  deleteMeta,
  getMetas,
  newMeta,
  updateMeta,
} from "../services/metas.service.js";

export const obtenerMetas = async (req: Request, res: Response) => {
  const metasUsuario = await getMetas(Number(req.user!.id));
  return res.status(200).json({ success: true, result: metasUsuario });
};

export const crearMeta = async (req: Request, res: Response) => {
  const nuevaMeta = req.body;
  const meta = await newMeta(Number(req.user!.id), nuevaMeta);
  return res.status(201).json({ message: "Meta creada", result: meta });
};

export const borrarMeta = async (req: Request, res: Response) => {
  const result = await deleteMeta(Number(req.params.id), req.user!.id);
  console.log(result);
  return res.status(200).json({ message: "Meta eliminada" });
};

export const actualizarMeta = async (req: Request, res: Response) => {
  const nuevaMeta = req.body;
  const success = await updateMeta(
    Number(req.params.id),
    Number(req.user?.id),
    nuevaMeta,
  );
  return res
    .status(200)
    .json({ success: success, message: "Meta actualizada" });
};
