import { toLowerCase, z } from "zod";

export const usuarioSchema = z.object({
  nombre: z.string().min(3).max(50).trim(),
  apellidos: z.string().min(3).max(50).trim(),
  email: z.email("Email invalido").trim().toLowerCase(),
  password: z.string().min(8, "Se requieren al menos 8 caracteres"),
});

export const loginSchema = z.object({
  email: z.email("Email invalido").trim().toLowerCase(),
  password: z.string().min(8, "Se requieren al menos 8 caracteres"),
});

export const cuentaSchema = z.object({
  idUsuario: z.number().int().positive(),
  nombreCuenta: z.string().min(3).max(50).trim(),
  saldoCuenta: z.number().nonnegative().optional(),
  tipoCuenta: z.enum(["cartera", "ahorro", "meta"]),
});

export const movimientoCuentaSchema = z.object({
  idCuenta: z.number().int().positive(),
  tipoMovimiento: z.enum(["ingreso", "gasto"]),
  cantidadMovimiento: z.number().positive(),
});

export const nuevaMetaSchema = z.object({
  nombreMeta: z.string().min(3).max(50).trim(),
  descripcionMeta: z.string().min(3).trim(),
  fechaInicio: z.coerce.date(),
  fechaLimite: z.coerce.date(),
  cantidadObjetivo: z.number().positive(),
  iconoMeta: z.string().optional(),
});

export const updateMetaSchema = z.object({
  nombreMeta: z.string().min(3).max(50).trim(),
  descripcionMeta: z.string().min(3).trim(),
  fechaLimite: z.coerce.date(),
  cantidadObjetivo: z.number().positive(),
  iconoMeta: z.string().optional(),
});

export const nuevaReglaSchema = z.object({
  nombreRegla: z.string().min(3).max(50).trim(),
  descripcionRegla: z.string().min(3).trim(),
  cantidadRegla: z.number().positive(),
  fechaInicio: z.coerce.date(),
  frecuencia: z.enum(["diario", "semanal", "mensual"]),
  intervalo: z.number().int().positive(),
  diaAplicacion: z.number().int().positive().optional(),
});

export const nuevoMovimientoSchema = z.object({
  categoriaMovimiento: z.number().int().optional(),
  descripcionMovimiento: z.string().min(3).trim(),
  tipoMovimiento: z.enum(["ingreso", "gasto", "transferencia"]),
  cantidadMovimiento: z.coerce.number().positive(),
  cuentaOrigen: z.number().int().positive().optional(),
  cuentaDestino: z.number().int().positive().optional(),
});

export const periodoSchema = z.object({
  inicio: z.string().min(10),
  final: z.string().min(10),
});

export const presupuestoSchema = z.object({
  idCategoria: z.number().int().positive(),
  tipoPresupuesto: z.enum(["porcentaje", "monto"]),
  cantidadPresupuesto: z.number().positive(),
});
