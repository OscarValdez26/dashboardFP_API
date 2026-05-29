import {
  pgTable,
  serial,
  integer,
  numeric,
  check,
  text,
  timestamp,
  varchar,
  index,
  boolean,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { usuarios } from "./usuarios.js";
import { cuentas } from "./cuentas.js";

export const metas = pgTable(
  "metas",
  {
    idMeta: serial("id_meta").primaryKey(),
    idUsuario: integer("id_usuario")
      .notNull()
      .references(() => usuarios.idUsuario, { onDelete: "restrict" }),
    idCuenta: integer("id_cuenta")
      .notNull()
      .references(() => cuentas.idCuenta, { onDelete: "cascade" }),
    nombreMeta: varchar("nombre_meta", { length: 50 }).notNull(),
    descripcionMeta: text("descripcion_meta").notNull(),
    fechaCreacion: timestamp("fecha_creacion", { withTimezone: true })
      .defaultNow()
      .notNull(),
    fechaInicio: timestamp("fecha_inicio", { withTimezone: true }).notNull(),
    fechaLimite: timestamp("fecha_limite", { withTimezone: true }).notNull(),
    fechaCierre: timestamp("fecha_cierre", { withTimezone: true }),
    cantidadObjetivo: numeric("cantidad_objetivo", {
      precision: 10,
      scale: 2,
    }).notNull(),
    iconoMeta: varchar("icono_meta", { length: 20 }).default(""),
    metaActiva: boolean("cuenta_activa").default(true),
  },
  (table) => [
    check("metas_check", sql`fecha_limite > fecha_inicio`),
    check("metas_objetivo_check", sql`cantidad_objetivo > 0`),
    index("metas_usuario_index").on(table.idUsuario),
    index("metas_cuenta_index").on(table.idCuenta),
  ],
);
