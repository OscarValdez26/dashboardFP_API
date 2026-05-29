import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";

export const tipoEnum = pgEnum("tipo_categoria_enum", ["ingreso", "gasto"]);

export const categorias = pgTable("categorias", {
  idCategoria: serial("id_categoria").primaryKey(),
  nombreCategoria: varchar("nombre_categoria", { length: 50 })
    .notNull()
    .unique(),
  descripcionCategoria: text("descripcion_categoria"),
  tipoCategoria: tipoEnum("tipo_categoria").notNull(),
  idCategoriaPadre: integer("id_categoria_padre"),
});
