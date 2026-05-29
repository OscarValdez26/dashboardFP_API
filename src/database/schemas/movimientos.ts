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
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { usuarios } from "./usuarios.js";
import { categorias } from "./categorias.js";
import { cuentas } from "./cuentas.js";

export const tipoEnum = pgEnum("tipo_movimiento_enum", [
  "ingreso",
  "gasto",
  "transferencia",
]);

export const movimientos = pgTable(
  "movimientos",
  {
    idMovimiento: serial("id_movimiento").primaryKey(),
    idUsuario: integer("id_usuario")
      .notNull()
      .references(() => usuarios.idUsuario, { onDelete: "restrict" }),
    categoriaMovimiento: integer("categoria_movimiento").references(
      () => categorias.idCategoria,
    ),
    descripcionMovimiento: text("descripcion_movimiento").notNull(),
    tipoMovimiento: tipoEnum("tipo_movimiento").notNull(),
    cantidadMovimiento: numeric("cantidad_movimiento", {
      precision: 10,
      scale: 2,
    }).notNull(),
    fechaMovimiento: timestamp("fecha_movimiento", { withTimezone: true })
      .defaultNow()
      .notNull(),
    cuentaOrigen: integer("cuenta_origen").references(() => cuentas.idCuenta),
    cuentaDestino: integer("cuenta_destino").references(() => cuentas.idCuenta),
  },
  (table) => [
    check("movimientos_cantidad_check", sql`cantidad_movimiento > 0`),
    check(
      "movimientos_cuentas_check",
      sql`
    (
      tipo_movimiento = 'ingreso' AND cuenta_destino IS NOT NULL AND cuenta_origen IS NULL
    ) OR (
      tipo_movimiento = 'gasto' AND cuenta_origen IS NOT NULL AND cuenta_destino IS NULL
    ) OR (
      tipo_movimiento = 'transferencia' AND cuenta_origen IS NOT NULL AND cuenta_destino IS NOT NULL
    )
  `,
    ),
    check(
      "movimientos_categoria_check",
      sql`
    (
      tipo_movimiento = 'transferencia' AND categoria_movimiento IS NULL
    ) OR (
      tipo_movimiento != 'transferencia' AND categoria_movimiento IS NOT NULL
    )
  `,
    ),
    index("movimientos_usuario_index").on(table.idUsuario),
    index("movimientos_categoria_index").on(table.categoriaMovimiento),
    index("movimientos_fecha_index").on(table.fechaMovimiento),
    index("movimientos_origen_index").on(table.cuentaOrigen),
    index("movimientos_destino_index").on(table.cuentaDestino),
  ],
);
