import { eq } from "drizzle-orm";
import { usuarios } from "../database/schemas/usuarios.js";
import { cuentas } from "../database/schemas/cuentas.js";
import { generarAccessToken, generarRefreshToken } from "../libs/token.js";
import { AppError } from "../libs/appError.js";
import db from "../db.js";
import bcrypt from "bcrypt";

export const registro = async (nuevoUsuario: any) => {
  const [usuarioExiste] = await db
    .select({ email: usuarios.email })
    .from(usuarios)
    .where(eq(usuarios.email, nuevoUsuario.email))
    .limit(1);
  if (usuarioExiste) throw new AppError("El usuario ya existe", 403);
  const hash = await bcrypt.hash(nuevoUsuario.password, 10);
  const data = { ...nuevoUsuario, password: hash };
  const usuario = await db.transaction(async (tx) => {
    const [usuarioNuevo] = await tx.insert(usuarios).values(data).returning({
      idUsuario: usuarios.idUsuario,
      nombre: usuarios.nombre,
      email: usuarios.email,
      verificado: usuarios.verificado,
    });
    await tx.insert(cuentas).values([
      {
        idUsuario: usuarioNuevo.idUsuario,
        nombreCuenta: "Cartera",
        tipoCuenta: "cartera",
        frecuenciaArqueo: "semanal",
      },
      {
        idUsuario: usuarioNuevo.idUsuario,
        nombreCuenta: "Ahorro",
        tipoCuenta: "ahorro",
        frecuenciaArqueo: "mensual",
      },
    ]);
    return usuarioNuevo;
  });
  const accessToken = generarAccessToken({ idUsuario: usuario.idUsuario });
  const refreshToken = generarRefreshToken({ idUsuario: usuario.idUsuario });
  const verificarToken = generarRefreshToken({ idUsuario: usuario.idUsuario });
  return [accessToken, refreshToken, verificarToken, usuario];
};

export const login = async (usuarioLogin: any) => {
  const [usuarioExiste] = await db
    .select({
      idUsuario: usuarios.idUsuario,
      nombre: usuarios.nombre,
      email: usuarios.email,
      password: usuarios.password,
      verificado: usuarios.verificado,
    })
    .from(usuarios)
    .where(eq(usuarios.email, usuarioLogin.email))
    .limit(1);
  if (!usuarioExiste) throw new AppError("El usuario no existe", 404);
  const match = await bcrypt.compare(
    usuarioLogin.password,
    usuarioExiste.password,
  );
  if (match) {
    const usuarioActivo = {
      idUsuario: usuarioExiste.idUsuario,
      nombre: usuarioExiste.nombre,
      email: usuarioExiste.email,
      verificado: usuarioExiste.verificado,
    };
    const accessToken = generarAccessToken({
      idUsuario: usuarioActivo.idUsuario,
    });
    const refreshToken = generarRefreshToken({
      idUsuario: usuarioActivo.idUsuario,
    });
    return [accessToken, refreshToken, usuarioActivo];
  } else {
    throw new AppError("Contraseña incorrecta", 400);
  }
};

export const getTokenPassword = async (email: string) => {
  const [existe] = await db
    .select({ idUsuario: usuarios.idUsuario })
    .from(usuarios)
    .where(eq(usuarios.email, email));
  if (!existe) return null;
  const token = generarAccessToken(existe);
  return token;
};

export const setNewPassword = async (idUsuario: number, password: string) => {
  const hash = await bcrypt.hash(password, 10);
  await db
    .update(usuarios)
    .set({
      password: hash,
    })
    .where(eq(usuarios.idUsuario, idUsuario));
  return true;
};

export const verificar = async (idUsuario: number) => {
  await db
    .update(usuarios)
    .set({
      verificado: true,
    })
    .where(eq(usuarios.idUsuario, idUsuario));
  return true;
};
