import { reglas } from "../database/schemas/reglas.js";
import db from "../db.js";
import { eq } from "drizzle-orm";
import { AppError } from "../libs/appError.js";

export const getReglas = async (id: number) => {
  const reglasUsuario = await db
    .select()
    .from(reglas)
    .where(eq(reglas.idUsuario, id));
  return reglasUsuario;
};

export const newRegla = async (id: number, regla: any) => {
  const [reglaExiste] = await db
    .select()
    .from(reglas)
    .where(eq(reglas.nombreRegla, regla.nombreRegla))
    .limit(1);
  if (reglaExiste) throw new AppError("La regla ya existe", 409);
  const [reglaCreada] = await db
    .insert(reglas)
    .values({ ...regla, idUsuario: id })
    .returning();
  return reglaCreada;
};

export const deleteRegla = async (id: number) => {
  const [reglaExiste] = await db
    .select()
    .from(reglas)
    .where(eq(reglas.idRegla, id))
    .limit(1);
  if (!reglaExiste) throw new AppError("La regla no existe", 404);
  await db.delete(reglas).where(eq(reglas.idRegla, id));
  return;
};
