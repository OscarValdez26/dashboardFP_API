import {
  pgTable,
  serial,
  integer,
  numeric,
  check,
  text,
  timestamp,
  pgEnum,
  index,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { usuarios } from "./usuarios.js";

export const frecuenciaEnum = pgEnum("reglas_enum", [
  "diario",
  "semanal",
  "mensual",
]);

export const reglas = pgTable(
  "reglas",
  {
    idRegla: serial("id_regla").primaryKey(),
    idUsuario: integer("id_usuario")
      .notNull()
      .references(() => usuarios.idUsuario, { onDelete: "restrict" }),
    nombreRegla: varchar("nombre_regla", { length: 50 }).notNull().unique(),
    descripcionRegla: text("descripcion_regla").notNull(),
    cantidadRegla: numeric("cantidad_regla", {
      precision: 10,
      scale: 2,
    }).notNull(),
    fechaInicio: timestamp("fecha_inicio", { withTimezone: true }).notNull(),
    frecuencia: frecuenciaEnum("frecuencia").notNull(),
    intervalo: integer("intervalo").notNull(),
    diaAplicacion: integer("dia_aplicacion"),
  },
  (table) => [
    check("reglas_cantidad_check", sql`cantidad_regla > 0`),
    check("reglasingreso_intervalo_check", sql`intervalo > 0`),
    index("reglas_usuario_index").on(table.idUsuario),
  ],
);
