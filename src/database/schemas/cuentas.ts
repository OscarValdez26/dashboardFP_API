import {
  pgTable,
  serial,
  varchar,
  integer,
  numeric,
  index,
  boolean,
  timestamp,
  pgEnum,
  check,
} from "drizzle-orm/pg-core";
import { usuarios } from "./usuarios.js";
import { sql } from "drizzle-orm";

export const tipoCuentaEnum = pgEnum("tipo_cuenta_enum", [
  "cartera",
  "ahorro",
  "meta",
]);

export const frecuenciaArqueoEnum = pgEnum("frecuencia_arqueo_enum", [
  "semanal",
  "quincenal",
  "mensual",
]);

export const cuentas = pgTable(
  "cuentas",
  {
    idCuenta: serial("id_cuenta").primaryKey(),
    idUsuario: integer("id_usuario")
      .notNull()
      .references(() => usuarios.idUsuario, { onDelete: "restrict" }),
    nombreCuenta: varchar("nombre_cuenta", { length: 50 }).notNull(),
    saldoCuenta: numeric("saldo_cuenta", { precision: 10, scale: 2 })
      .default("0")
      .notNull(),
    cuentaActiva: boolean("cuenta_activa").default(true),
    fechaCierre: timestamp("fecha_cierre", { withTimezone: true }),
    tipoCuenta: tipoCuentaEnum("tipo_cuenta").notNull(),
    frecuenciaArqueo: frecuenciaArqueoEnum("frecuencia_arqueo")
      .notNull()
      .default("mensual"),
    diaArqueo: integer("dia_arqueo").notNull().default(1),
    diaArqueoSecundario: integer("dia_arqueo_secundario"),
  },
  (table) => [
    index("cuentas_usuario_index").on(table.idUsuario),
    check(
      "check_dia_arqueo_valido",
      sql`
        (
          ${table.frecuenciaArqueo} = 'semanal' AND ${table.diaArqueo} BETWEEN 1 AND 7
        )
        OR
        (
          ${table.frecuenciaArqueo} IN ('mensual', 'quincenal') AND ${table.diaArqueo} BETWEEN 1 AND 31
        )
      `,
    ),
  ],
);
