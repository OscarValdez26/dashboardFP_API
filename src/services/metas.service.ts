import { metas } from "../database/schemas/metas.js";
import db from "../db.js";
import { eq, and, sql } from "drizzle-orm";
import { AppError } from "../libs/appError.js";
import { cuentas } from "../database/schemas/cuentas.js";

export const getMetas = async (id: number) => {
  const metasUsuario = await db
    .select({
      idMeta: metas.idMeta,
      idCuenta: metas.idCuenta,
      nombre: metas.nombreMeta,
      descripcion: metas.descripcionMeta,
      fechaInicio: metas.fechaInicio,
      fechaLimite: metas.fechaLimite,
      saldo: cuentas.saldoCuenta,
      objetivo: metas.cantidadObjetivo,
      icono: metas.iconoMeta,
      progreso: sql<number>`ROUND((${cuentas.saldoCuenta} / ${metas.cantidadObjetivo}) * 100,2)`,
    })
    .from(metas)
    .innerJoin(cuentas, eq(cuentas.idCuenta, metas.idCuenta))
    .where(and(eq(metas.idUsuario, id), eq(metas.metaActiva, true)));
  return metasUsuario;
};

export const newMeta = async (id: number, nuevaMeta: any) => {
  const [metaExiste] = await db
    .select()
    .from(metas)
    .where(
      and(
        eq(metas.idUsuario, id),
        eq(metas.nombreMeta, nuevaMeta.nombreMeta),
        eq(metas.metaActiva, true),
      ),
    )
    .limit(1);
  if (metaExiste) throw new AppError("La meta ya existe", 409);
  const meta = await db.transaction(async (tx) => {
    const [cuenta] = await tx
      .insert(cuentas)
      .values({
        idUsuario: id,
        nombreCuenta: nuevaMeta.nombreMeta,
        tipoCuenta: "meta",
      })
      .returning({
        idCuenta: cuentas.idCuenta,
        saldoCuenta: cuentas.saldoCuenta,
      });
    const [data] = await tx
      .insert(metas)
      .values({
        ...nuevaMeta,
        idCuenta: cuenta.idCuenta,
        idUsuario: id,
        saldoCuenta: cuenta.saldoCuenta,
      })
      .returning();
    return data;
  });
  return meta;
};

export const deleteMeta = async (id: number, idUsuario: number) => {
  const [meta] = await db
    .select()
    .from(metas)
    .where(and(eq(metas.idMeta, id), eq(metas.metaActiva, true)))
    .limit(1);
  if (!meta) throw new AppError("No existe la meta", 404);
  if (meta.idUsuario != idUsuario) throw new AppError("No autorizado", 403);
  const [cuenta] = await db
    .select()
    .from(cuentas)
    .where(eq(cuentas.idCuenta, meta.idCuenta))
    .limit(1);
  if (Number(cuenta.saldoCuenta) > 0)
    throw new AppError("La meta no debe tener saldo", 400);
  const success = await db.transaction(async (tx) => {
    await tx
      .update(metas)
      .set({ fechaCierre: sql`now()`, metaActiva: false })
      .where(eq(metas.idMeta, meta.idMeta));
    await tx
      .update(cuentas)
      .set({ fechaCierre: sql`now()`, cuentaActiva: false })
      .where(eq(cuentas.idCuenta, cuenta.idCuenta));
  });
  return success;
};

export const updateMeta = async (
  idMeta: number,
  idUsuario: number,
  nuevaMeta: any,
) => {
  const success = await db.transaction(async (tx) => {
    const [meta] = await tx
      .select()
      .from(metas)
      .where(eq(metas.idMeta, idMeta));
    if (!meta) throw new AppError("No existe la meta", 404);
    if (meta.idUsuario != idUsuario) throw new AppError("No autorizado", 403);
    await tx
      .update(metas)
      .set({
        nombreMeta: nuevaMeta.nombreMeta,
        descripcionMeta: nuevaMeta.descripcionMeta,
        fechaLimite: nuevaMeta.fechaLimite,
        cantidadObjetivo: nuevaMeta.cantidadObjetivo,
        iconoMeta: nuevaMeta.iconoMeta,
      })
      .where(and(eq(metas.idMeta, idMeta), eq(metas.idUsuario, idUsuario)));
    return true;
  });
  return success;
};
