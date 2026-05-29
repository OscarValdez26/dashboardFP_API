import {
  pgTable,
  serial,
  integer,
  numeric,
  check,
  unique,
  timestamp,
  pgEnum,
  index,
  boolean,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { usuarios } from "./usuarios.js";
import { categorias } from "./categorias.js";

export const tipoEnum = pgEnum("tipo_presupuesto_enum", [
  "monto",
  "porcentaje",
]);

export const presupuestos = pgTable(
  "presupuestos",
  {
    idPresupuesto: serial("id_presupuesto").primaryKey(),
    idUsuario: integer("id_usuario")
      .notNull()
      .references(() => usuarios.idUsuario, { onDelete: "restrict" }),
    idCategoria: integer("id_categoria")
      .notNull()
      .references(() => categorias.idCategoria, { onDelete: "restrict" }),
    fechaCreacion: timestamp("fecha_creacion", { withTimezone: true })
      .defaultNow()
      .notNull(),
    tipoPresupuesto: tipoEnum("tipo_presupuesto").notNull(),
    cantidadPresupuesto: numeric("cantidad_presupuesto", {
      precision: 10,
      scale: 2,
    }).notNull(),
    presupuestoActivo: boolean("presupuesto_activo").default(true),
  },
  (table) => [
    unique("presupuestos_usuario_categoria_key").on(
      table.idUsuario,
      table.idCategoria,
    ),
    check(
      "presupuestos_check",
      sql`(
      (tipo_presupuesto = 'porcentaje' AND cantidad_presupuesto > 0 AND cantidad_presupuesto <= 100)
      OR
      (tipo_presupuesto = 'monto' AND cantidad_presupuesto > 0)
    )`,
    ),
    index("presupuestos_usuario_index").on(table.idUsuario),
  ],
);
