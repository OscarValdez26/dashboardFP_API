import type { Request, Response } from "express";
import {
  getCategorias,
  getUnaCategoria,
} from "../services/categorias.service.js";

export const obtenerCategorias = async (req: Request, res: Response) => {
  const data = await getCategorias();
  return res.status(200).json({ success: true, result: data });
};

export const obtenerCategoria = async (req: Request, res: Response) => {
  const categoria = await getUnaCategoria(Number(req.params.id));
  return res.status(200).json(categoria);
};
