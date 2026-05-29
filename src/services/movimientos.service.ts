import { movimientos } from "../database/schemas/movimientos.js";
import { nuevoMovimiento } from "./cuentas.service.js";
import db from "../db.js";
import { eq, and, or, desc, sql, gte, lt, lte } from "drizzle-orm";
import { Result } from "pg";
import { cuentas } from "../database/schemas/cuentas.js";
import { categorias } from "../database/schemas/categorias.js";

export const getMovimientos = async (id: number) => {
  const movimientosUsuario = await db
    .select()
    .from(movimientos)
    .where(eq(movimientos.idUsuario, id));
  return movimientosUsuario;
};

export const newMovimiento = async (id: number, movimiento: any) => {
  const movimientoNuevo = {
    idCuenta: 0,
    tipoMovimiento: movimiento.tipoMovimiento,
    cantidadMovimiento: movimiento.cantidadMovimiento,
  };
  if (movimiento.tipoMovimiento === "ingreso") {
    movimientoNuevo.idCuenta = movimiento.cuentaDestino;
    const resultado = await db.transaction(async (tx) => {
      await tx.insert(movimientos).values({ ...movimiento, idUsuario: id });
      return await nuevoMovimiento(tx, id, movimientoNuevo);
    });
    return resultado;
  }
  if (movimiento.tipoMovimiento === "gasto") {
    movimientoNuevo.idCuenta = movimiento.cuentaOrigen;
    const resultado = await db.transaction(async (tx) => {
      await tx.insert(movimientos).values({ ...movimiento, idUsuario: id });
      return await nuevoMovimiento(tx, id, movimientoNuevo);
    });
    return resultado;
  }
  if (movimiento.tipoMovimiento === "transferencia") {
    const result = await db.transaction(async (tx) => {
      await tx.insert(movimientos).values({ ...movimiento, idUsuario: id });
      const origen = await nuevoMovimiento(tx, id, {
        ...movimientoNuevo,
        idCuenta: movimiento.cuentaOrigen,
        tipoMovimiento: "gasto",
      });
      const destino = await nuevoMovimiento(tx, id, {
        ...movimientoNuevo,
        idCuenta: movimiento.cuentaDestino,
        tipoMovimiento: "ingreso",
      });
      return [origen, destino];
    });
    return result;
  }
};

export const movimientosRecientes = async (id: number) => {
  const ultimosMovimientos = await db
    .select({
      idCuenta: cuentas.idCuenta,
      cuenta: cuentas.nombreCuenta,
      tipoMovimiento: movimientos.tipoMovimiento,
      categoriaMovimiento: categorias.nombreCategoria,
      descripcionMovimiento: movimientos.descripcionMovimiento,
      cantidadMovimiento: movimientos.cantidadMovimiento,
      fechaMovimiento: movimientos.fechaMovimiento,
      cuentaOrigen: movimientos.cuentaOrigen,
      cuentaDestino: movimientos.cuentaDestino,
    })
    .from(movimientos)
    .innerJoin(cuentas, eq(movimientos.idUsuario, cuentas.idUsuario))
    .leftJoin(
      categorias,
      eq(movimientos.categoriaMovimiento, categorias.idCategoria),
    )
    .where(
      and(
        eq(movimientos.idUsuario, id),
        or(
          eq(cuentas.idCuenta, movimientos.cuentaOrigen),
          eq(cuentas.idCuenta, movimientos.cuentaDestino),
        ),
      ),
    )
    .orderBy(desc(movimientos.fechaMovimiento))
    .limit(20);
  return ultimosMovimientos;
};

export const getPeriodo = async (
  id: number,
  fechaInicio: Date,
  fechaFinal: Date,
) => {
  const movimientosPeriodo = await db
    .select({
      idCuenta: cuentas.idCuenta,
      cuenta: cuentas.nombreCuenta,
      tipoMovimiento: movimientos.tipoMovimiento,
      categoriaMovimiento: categorias.nombreCategoria,
      descripcionMovimiento: movimientos.descripcionMovimiento,
      cantidadMovimiento: movimientos.cantidadMovimiento,
      fechaMovimiento: movimientos.fechaMovimiento,
      cuentaOrigen: movimientos.cuentaOrigen,
      cuentaDestino: movimientos.cuentaDestino,
    })
    .from(movimientos)
    .innerJoin(cuentas, eq(movimientos.idUsuario, cuentas.idUsuario))
    .leftJoin(
      categorias,
      eq(movimientos.categoriaMovimiento, categorias.idCategoria),
    )
    .where(
      and(
        eq(movimientos.idUsuario, id),
        or(
          eq(cuentas.idCuenta, movimientos.cuentaOrigen),
          eq(cuentas.idCuenta, movimientos.cuentaDestino),
        ),
        gte(movimientos.fechaMovimiento, fechaInicio),
        lte(movimientos.fechaMovimiento, fechaFinal),
      ),
    )
    .orderBy(desc(movimientos.fechaMovimiento));
  return movimientosPeriodo;
};

export const getGastos = async (id: number) => {
  const inicioMes = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  );

  const inicioSiguienteMes = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    1,
  );
  const gastosPorCategoria = await db
    .select({
      categoria: categorias.nombreCategoria,
      totalGastado: sql`
      SUM(${movimientos.cantidadMovimiento})
    `.as("total_gastado"),
    })
    .from(movimientos)
    .innerJoin(cuentas, eq(cuentas.idCuenta, movimientos.cuentaOrigen))
    .innerJoin(
      categorias,
      eq(categorias.idCategoria, movimientos.categoriaMovimiento),
    )
    .where(
      and(
        eq(movimientos.tipoMovimiento, "gasto"),
        eq(cuentas.nombreCuenta, "Cartera"),
        eq(movimientos.idUsuario, id),
        gte(movimientos.fechaMovimiento, inicioMes),
        lt(movimientos.fechaMovimiento, inicioSiguienteMes),
      ),
    )
    .groupBy(categorias.nombreCategoria);
  return gastosPorCategoria;
};
