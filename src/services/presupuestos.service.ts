import { categorias } from "../database/schemas/categorias.js";
import { presupuestos } from "../database/schemas/presupuestos.js";
import db from "../db.js";
import { eq, and, gt } from "drizzle-orm";
import { AppError } from "../libs/appError.js";

export const getPresupuestos = async (id: number) => {
  const data = await db
    .select({
      idPresupuesto: presupuestos.idPresupuesto,
      categoria: categorias.nombreCategoria,
      tipoPresupuesto: presupuestos.tipoPresupuesto,
      cantidadPresupuesto: presupuestos.cantidadPresupuesto,
    })
    .from(presupuestos)
    .innerJoin(categorias, eq(categorias.idCategoria, presupuestos.idCategoria))
    .where(
      and(
        eq(presupuestos.idUsuario, id),
        eq(presupuestos.presupuestoActivo, true),
      ),
    );
  return data;
};

export const newPresupuesto = async (idUsuario: number, data: any) => {
  const [existe] = await db
    .select()
    .from(presupuestos)
    .where(
      and(
        eq(presupuestos.idCategoria, data.idCategoria),
        eq(presupuestos.idUsuario, idUsuario),
      ),
    );
  if (existe && existe.presupuestoActivo === true)
    throw new AppError("El presupuesto ya existe", 403);
  if (existe && existe.presupuestoActivo === false) {
    const [nuevo] = await db
      .update(presupuestos)
      .set({ ...data, presupuestoActivo: true })
      .where(
        and(
          eq(presupuestos.idCategoria, data.idCategoria),
          eq(presupuestos.idUsuario, idUsuario),
        ),
      )
      .returning();
    if (nuevo) return true;
  }
  const nuevo = await db
    .insert(presupuestos)
    .values({
      ...data,
      idUsuario: idUsuario,
      presupuestoActivo: true,
    })
    .returning();
  if (nuevo) return true;
  else throw new AppError("Error al crear presupuesto", 500);
};

export const updatePresupuesto = async (
  idPresupuesto: number,
  idUsuario: number,
  data: any,
) => {
  const [existe] = await db
    .select()
    .from(presupuestos)
    .where(eq(presupuestos.idPresupuesto, idPresupuesto));
  if (!existe) throw new AppError("No existe el presupuesto", 404);
  const nuevo = await db
    .update(presupuestos)
    .set(data)
    .where(eq(presupuestos.idPresupuesto, idPresupuesto))
    .returning();
  if (nuevo) return true;
  else throw new AppError("Error al actualizar presupuesto", 500);
};

export const deletePresupuesto = async (
  idPresupuesto: number,
  idUsuario: number,
) => {
  const [existe] = await db
    .select()
    .from(presupuestos)
    .where(eq(presupuestos.idPresupuesto, idPresupuesto));
  if (!existe) throw new AppError("No existe el presupuesto", 404);
  if (existe && existe.idUsuario !== idUsuario)
    throw new AppError("Usuario incorrecto", 403);
  await db
    .update(presupuestos)
    .set({ presupuestoActivo: false })
    .where(
      and(
        eq(presupuestos.idUsuario, idUsuario),
        eq(presupuestos.idPresupuesto, idPresupuesto),
      ),
    );
  return true;
};
