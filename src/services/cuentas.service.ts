import { cuentas, tipoCuentaEnum } from "../database/schemas/cuentas.js";
import db from "../db.js";
import {
  eq,
  sql,
  and,
  desc,
  sum,
  between,
  gt,
  max,
  or,
  isNull,
  ne,
  gte,
  lt,
} from "drizzle-orm";
import { AppError } from "../libs/appError.js";
// import { arqueos } from "../database/schemas/arqueos.js";
import { movimientos } from "../database/schemas/movimientos.js";

type HistorialItem = {
  mes: string;
  tipoCuenta: "cartera" | "ahorro" | "meta";
  ingresos: number;
  gastos: number;
  balance: number;
};

export const getCuentas = async (id: number) => {
  const inicioMes = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  );
  const resumen = db
    .select({
      idCuenta: cuentas.idCuenta,
      ingresos: sql<number>`
      COALESCE(SUM(
        CASE
          WHEN ${movimientos.tipoMovimiento} = 'ingreso'
          AND ${movimientos.cuentaDestino} = ${cuentas.idCuenta}
          THEN ${movimientos.cantidadMovimiento}
          ELSE 0
        END
      ), 0)
    `.as("ingresos"),
      gastos: sql<number>`
      COALESCE(SUM(
        CASE
          WHEN ${movimientos.tipoMovimiento} = 'gasto'
          AND ${movimientos.cuentaOrigen} = ${cuentas.idCuenta}
          THEN ${movimientos.cantidadMovimiento}
          ELSE 0
        END
      ), 0)
    `.as("gastos"),
      ingresosT: sql<number>`
      COALESCE(SUM(
        CASE
          WHEN ${movimientos.tipoMovimiento} = 'transferencia'
          AND ${movimientos.cuentaDestino} = ${cuentas.idCuenta}
          THEN ${movimientos.cantidadMovimiento}
          ELSE 0
        END
      ), 0)
    `.as("ingresosT"),
      gastosT: sql<number>`
      COALESCE(SUM(
        CASE
          WHEN  ${movimientos.tipoMovimiento} = 'transferencia'
          AND ${movimientos.cuentaOrigen} = ${cuentas.idCuenta}
          THEN ${movimientos.cantidadMovimiento}
          ELSE 0
        END
      ), 0)
    `.as("gastosT"),
    })
    .from(cuentas)
    .leftJoin(
      movimientos,
      and(
        eq(movimientos.idUsuario, id),
        or(
          eq(movimientos.cuentaOrigen, cuentas.idCuenta),
          eq(movimientos.cuentaDestino, cuentas.idCuenta),
        ),
      ),
    )
    .where(or(gt(movimientos.fechaMovimiento, inicioMes)))
    .groupBy(cuentas.idCuenta)
    .as("resumen");
  const cuentasExistentes = await db
    .select({
      idCuenta: cuentas.idCuenta,
      nombre: cuentas.nombreCuenta,
      saldo: cuentas.saldoCuenta,
      tipo: cuentas.tipoCuenta,
      fechaInicio: sql`${inicioMes}`,
      fechaFinal: sql<Date>`now()`,
      ingresos: sql<number>`COALESCE (${resumen.ingresos},0)`,
      gastos: sql<number>`COALESCE(${resumen.gastos},0)`,
      ingresosT: sql<number>`COALESCE (${resumen.ingresosT},0)`,
      gastosT: sql<number>`COALESCE(${resumen.gastosT},0)`,
      porcentaje: sql<number>`COALESCE(
      CASE
        WHEN ${resumen.ingresos} = 0 THEN 0
        ELSE ROUND(
          (${resumen.gastos} / ${resumen.ingresos}) * 100,
          2
        )
      END,0)
    `.as("porcentaje"),
    })
    .from(cuentas)
    .leftJoin(resumen, eq(resumen.idCuenta, cuentas.idCuenta))
    .where(and(eq(cuentas.idUsuario, id), eq(cuentas.cuentaActiva, true)));
  return cuentasExistentes;
};

// export const nuevaCuenta = async (cuenta: any) => {
//   const cuentaNueva = await db.insert(cuentas).values(cuenta).returning();
//   return cuentaNueva;
// };

export const nuevoMovimiento = async (tx: any, id: number, movimiento: any) => {
  const [cuentaExiste] = await tx
    .select()
    .from(cuentas)
    .where(eq(cuentas.idCuenta, movimiento.idCuenta))
    .limit(1);
  if (!cuentaExiste || cuentaExiste.idUsuario != id)
    throw new AppError("No autorizado", 403);
  if (
    movimiento.tipoMovimiento === "gasto" &&
    cuentaExiste.saldoCuenta < movimiento.cantidadMovimiento
  )
    throw new AppError("Saldo insuficiente", 400);
  const nuevoSaldo = await tx
    .update(cuentas)
    .set({
      saldoCuenta:
        movimiento.tipoMovimiento === "ingreso"
          ? sql`${cuentas.saldoCuenta} + ${movimiento.cantidadMovimiento}`
          : sql`${cuentas.saldoCuenta} - ${movimiento.cantidadMovimiento}`,
    })
    .where(eq(cuentas.idCuenta, movimiento.idCuenta))
    .returning({
      idCuenta: cuentas.idCuenta,
      nombreCuenta: cuentas.nombreCuenta,
      saldoCuenta: cuentas.saldoCuenta,
    });
  return nuevoSaldo;
};

// export const generateArqueo = async (id: number, idUsuario: number) => {
//   const [result] = await db.transaction(async (tx) => {
//     const [cuentaExiste] = await tx
//       .select()
//       .from(cuentas)
//       .where(eq(cuentas.idCuenta, id));
//     if (!cuentaExiste) throw new AppError("La cuenta no existe", 404);
//     const [ultimoArqueo] = await tx
//       .select()
//       .from(arqueos)
//       .where(eq(arqueos.idUsuario, idUsuario))
//       .orderBy(desc(arqueos.fechaFinal))
//       .limit(1);
//     const fechaInicio = ultimoArqueo?.fechaFinal || new Date(0);
//     const fechaFinal = new Date();
//     const [resumen] = await tx
//       .select({
//         ingresos: sql<number>`
//       COALESCE(SUM(CASE
//         WHEN ${movimientos.cuentaDestino} = ${id}
//         THEN ${movimientos.cantidadMovimiento}
//         ELSE 0
//       END), 0)
//     `,
//         gastos: sql<number>`
//       COALESCE(SUM(CASE
//         WHEN ${movimientos.cuentaOrigen} = ${id}
//         THEN ${movimientos.cantidadMovimiento}
//         ELSE 0
//       END), 0)
//     `,
//       })
//       .from(movimientos)
//       .where(
//         and(
//           eq(movimientos.idUsuario, idUsuario),
//           between(movimientos.fechaMovimiento, fechaInicio, fechaFinal),
//         ),
//       );
//     const saldoInicial = Number(ultimoArqueo?.saldoFinal) || 0;
//     const saldoFinal =
//       saldoInicial + Number(resumen.ingresos) - Number(resumen.gastos);
//     const arqueo = {
//       idUsuario: idUsuario,
//       idCuenta: id,
//       fechaInicio: fechaInicio,
//       fechaFinal: fechaFinal,
//       saldoInicial: saldoInicial.toString(),
//       saldoFinal: saldoFinal.toString(),
//       totalIngresos: resumen.ingresos.toString(),
//       totalGastos: resumen.gastos.toString(),
//     };
//     return await tx.insert(arqueos).values(arqueo).returning();
//   });
//   return result;
// };

export const eliminarCuenta = async (id: number, idUsuario: number) => {
  const [cuentaExiste] = await db
    .select()
    .from(cuentas)
    .where(and(eq(cuentas.idCuenta, id), eq(cuentas.cuentaActiva, true)));
  if (!cuentaExiste) throw new AppError("No existe la cuenta", 404);
  if (cuentaExiste.idUsuario != idUsuario)
    throw new AppError("No autorizado", 403);
  if (
    cuentaExiste.tipoCuenta === "cartera" ||
    cuentaExiste.tipoCuenta === "ahorro"
  )
    throw new AppError("No se puede borrar la cuenta", 403);
  if (Number(cuentaExiste.saldoCuenta) > 0)
    throw new AppError("La cuenta no debe tener saldo", 400);
  await db
    .update(cuentas)
    .set({ fechaCierre: sql`now()`, cuentaActiva: false })
    .where(eq(cuentas.idCuenta, id));
  return;
};

export const getHistorial = async (id: number) => {
  const haceTresMeses = new Date();
  haceTresMeses.setUTCMonth(haceTresMeses.getUTCMonth() - 3);
  haceTresMeses.setUTCDate(1);
  haceTresMeses.setUTCHours(0, 0, 0, 0);
  const esteMes = new Date();
  esteMes.setUTCDate(1);
  esteMes.setUTCHours(0, 0, 0, 0);
  const historial = await db
    .select({
      mes: sql<string>`
        TO_CHAR(
          DATE_TRUNC('month', ${movimientos.fechaMovimiento}),
          'YYYY-MM'
        )
      `.as("mes"),
      tipoCuenta: cuentas.tipoCuenta,

      ingresos: sql<number>`
        COALESCE(SUM(
          CASE
            WHEN (${movimientos.tipoMovimiento} = 'ingreso' OR ${movimientos.tipoMovimiento} = 'transferencia')
            AND ${movimientos.cuentaDestino} = ${cuentas.idCuenta}
            THEN ${movimientos.cantidadMovimiento}
            ELSE 0
          END
        ),0)
      `.as("ingresos"),

      gastos: sql<number>`
        COALESCE(SUM(
          CASE
            WHEN (${movimientos.tipoMovimiento} = 'gasto' OR ${movimientos.tipoMovimiento} = 'transferencia')
            AND ${movimientos.cuentaOrigen} = ${cuentas.idCuenta}
            THEN ${movimientos.cantidadMovimiento}
            ELSE 0
          END
        ),0)
      `.as("gastos"),

      balance: sql<number>`
        COALESCE(SUM(
          CASE
            WHEN (${movimientos.tipoMovimiento} = 'ingreso' OR ${movimientos.tipoMovimiento} = 'transferencia')
            AND ${movimientos.cuentaDestino} = ${cuentas.idCuenta}
            THEN ${movimientos.cantidadMovimiento}

            WHEN (${movimientos.tipoMovimiento} = 'gasto' OR ${movimientos.tipoMovimiento} = 'transferencia')
            AND ${movimientos.cuentaOrigen} = ${cuentas.idCuenta}
            THEN -${movimientos.cantidadMovimiento}

            ELSE 0
          END
        ),0)
      `.as("balance"),
    })

    .from(cuentas)

    .leftJoin(
      movimientos,
      and(
        eq(movimientos.idUsuario, id),

        or(
          eq(movimientos.cuentaOrigen, cuentas.idCuenta),
          eq(movimientos.cuentaDestino, cuentas.idCuenta),
        ),
      ),
    )
    .where(
      and(
        eq(cuentas.idUsuario, id),
        // eq(cuentas.tipoCuenta, tipoCuenta),
        gte(movimientos.fechaMovimiento, haceTresMeses),
        lt(movimientos.fechaMovimiento, esteMes),
      ),
    )

    .groupBy(
      sql`DATE_TRUNC('month', ${movimientos.fechaMovimiento})`,
      cuentas.tipoCuenta,
    )

    .orderBy(sql`DATE_TRUNC('month', ${movimientos.fechaMovimiento}) DESC`);

  const resultado: {
    ultimoMes: HistorialItem[];
    penultimoMes: HistorialItem[];
    antepenultimoMes: HistorialItem[];
  } = {
    ultimoMes: [],
    penultimoMes: [],
    antepenultimoMes: [],
  };

  const meses = [...new Set(historial.map((item) => item.mes))];
  console.log(meses);

  resultado.ultimoMes = historial.filter((item) => item.mes === meses[0]);

  resultado.penultimoMes = historial.filter((item) => item.mes === meses[1]);

  resultado.antepenultimoMes = historial.filter(
    (item) => item.mes === meses[2],
  );

  return resultado;
};
