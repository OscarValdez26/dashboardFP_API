import type { Request, Response } from "express";
import {
  eliminarCuenta,
  // generateArqueo,
  getCuentas,
  getHistorial,
  // nuevaCuenta,
  nuevoMovimiento,
} from "../services/cuentas.service.js";

export const obtenerCuentas = async (req: Request, res: Response) => {
  const cuentas = await getCuentas(Number(req.user!.id));
  return res.status(200).json({ success: true, result: cuentas });
};

// export const crearCuenta = async (req: Request, res: Response) => {
//   const cuenta = req.body;
//   const cuentaNueva = await nuevaCuenta(cuenta);
//   return res
//     .status(201)
//     .json({ message: "Cuenta creada", cuenta: cuentaNueva });
// };

// export const movimientoCuenta = async (req: Request, res: Response) => {
//   const movimiento = req.body;
//   const nuevoSaldo = await nuevoMovimiento(Number(req.user!.id), movimiento);
//   return res.status(200).json(nuevoSaldo);
// };

// export const generarArqueo = async (req: Request, res: Response) => {
//   const result = await generateArqueo(
//     Number(req.params.id),
//     Number(req.user!.id),
//   );
//   return res.status(200).json({ message: "Arqueo exitoso", result: result });
// };

export const borrarCuenta = async (req: Request, res: Response) => {
  await eliminarCuenta(Number(req.params.id), Number(req.user!.id));
  return res.status(200).json({ message: "Cuenta cerrada" });
};

export const obtenerHistorial = async (req: Request, res: Response) => {
  const id = Number(req.user?.id);
  const historial = await getHistorial(id);
  return res.status(200).json({ success: true, result: historial });
};
