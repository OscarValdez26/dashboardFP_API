import { usuarios } from "../database/schemas/usuarios.js";
import type { Request, Response } from "express";
import { ConsoleLogWriter, eq } from "drizzle-orm";
import db from "../db.js";
import {
  registro,
  login,
  getTokenPassword,
  setNewPassword,
  verificar,
} from "../services/usuarios.service.js";
import {
  generarAccessToken,
  validarAccessToken,
  validarRefreshToken,
} from "../libs/token.js";
import { emailRecuperacion, emailVerificacion } from "../libs/resend.js";
import "dotenv/config";
import { AppError } from "../libs/appError.js";

export const obtenerUsuarios = async (req: Request, res: Response) => {
  try {
    const listaUsuarios = await db.select().from(usuarios);
    return res.status(200).json(listaUsuarios);
  } catch (error) {
    return res.status(500).json(error);
  }
};

export const obtenerUsuario = async (req: Request, res: Response) => {
  try {
    const idUsuario = Number(req.params.id);
    const [usuario] = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.idUsuario, idUsuario))
      .limit(1);
    if (usuario == null) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    return res.status(200).json(usuario);
  } catch (error) {
    return res.status(500).json(error);
  }
};

export const registrarUsuario = async (req: Request, res: Response) => {
  const nuevoUsuario = req.body;
  const [accessToken, refreshToken, verificarToken, usuario] =
    await registro(nuevoUsuario);
  const enlace = `${process.env.FRONTEND_URL}/verificar-email?token=${verificarToken}`;
  emailVerificacion(nuevoUsuario.email, enlace);
  res.cookie("refreshToken", refreshToken, {
    sameSite: "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return res
    .status(200)
    .json({ message: "Usuario registrado con exito", usuario, accessToken });
};

export const loginUsuario = async (req: Request, res: Response) => {
  const usuarioLogin = req.body;
  const [accessToken, refreshToken, usuario] = await login(usuarioLogin);
  res.cookie("refreshToken", refreshToken, {
    sameSite: "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return res
    .status(200)
    .json({ message: "Sesion iniciada", usuario, accessToken });
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie("refreshToken");
  return res.status(200).json({ message: "Sesion cerrada" });
};

export const refresh = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: "No autorizado" });
  }
  const validar = validarRefreshToken(refreshToken);
  if (validar.success) {
    const accessToken = generarAccessToken({
      idUsuario: validar.result.idUsuario,
    });
    return res.status(200).json({ accessToken });
  }
  res.clearCookie("refreshToken");
  return res.status(403).json({ message: "Refresh token invalido" });
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  const token = await getTokenPassword(email);
  if (!token)
    return res.status(200).json({
      message:
        "Si el usuario existe se enviará un enlace de recuperación a su email",
    });
  if (token) {
    const enlace = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    emailRecuperacion(email, enlace);
  }
  return res
    .status(200)
    .json({
      message:
        "Enlace de recuperación enviado a su email, no olvide revisar en la carpeta de spam",
    });
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, password } = req.body;
  try {
    const valido = validarAccessToken(token);
    if (valido.success) {
      const success = await setNewPassword(valido.result.idUsuario, password);
      return res.status(200).json({
        message: "Contraseña actualizada",
      });
    } else {
      throw new Error();
    }
  } catch {
    return res.status(400).json({
      message: "Enlace invalido o expirado",
    });
  }
};

export const verificarEmail = async (req: Request, res: Response) => {
  const { token } = req.body;
  try {
    const valido = validarRefreshToken(token);
    if (valido.success) {
      console.log(valido.result.idUsuario);
      const success = await verificar(valido.result.idUsuario);
      if (success)
        return res.status(200).json({
          message: "Email verificado",
        });
      else throw new AppError("Error al verificar email", 500);
    } else {
      throw new Error();
    }
  } catch {
    return res.status(400).json({
      message: "Enlace invalido o expirado",
    });
  }
};
