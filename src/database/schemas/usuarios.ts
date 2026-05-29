import {
  serial,
  pgTable,
  timestamp,
  varchar,
  boolean,
} from "drizzle-orm/pg-core";

export const usuarios = pgTable("usuarios", {
  idUsuario: serial("id_usuario").primaryKey().notNull(),
  nombre: varchar("nombre", { length: 50 }).notNull(),
  apellidos: varchar("apellidos", { length: 50 }).notNull(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  password: varchar("password", { length: 100 }).notNull(),
  fecharegistro: timestamp("fecha_registro", { withTimezone: true })
    .defaultNow()
    .notNull(),
  verificado: boolean("verificado").default(false),
});
