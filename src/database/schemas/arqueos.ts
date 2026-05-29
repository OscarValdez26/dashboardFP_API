import {
  pgTable,
  serial,
  integer,
  numeric,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { usuarios } from "./usuarios.js";
import { cuentas } from "./cuentas.js";

export const arqueos = pgTable(
  "arqueos",
  {
    idArqueo: serial("id_arqueo").primaryKey(),
    idUsuario: integer("id_usuario")
      .notNull()
      .references(() => usuarios.idUsuario, { onDelete: "restrict" }),
    idCuenta: integer("id_cuenta")
      .notNull()
      .references(() => cuentas.idCuenta),
    fechaCreacion: timestamp("fecha_creacion", { withTimezone: true })
      .defaultNow()
      .notNull(),
    fechaInicio: timestamp("fecha_inicio", { withTimezone: true }).notNull(),
    fechaFinal: timestamp("fecha_final", { withTimezone: true }).notNull(),
    saldoInicial: numeric("saldo_inicial", {
      precision: 10,
      scale: 2,
    }).notNull(),
    saldoFinal: numeric("saldo_final", { precision: 10, scale: 2 }).notNull(),
    totalIngresos: numeric("total_ingresos", {
      precision: 10,
      scale: 2,
    }).notNull(),
    totalGastos: numeric("total_gastos", { precision: 10, scale: 2 }).notNull(),
  },
  (table) => [index("arqueos_usuario_index").on(table.idUsuario)],
);
