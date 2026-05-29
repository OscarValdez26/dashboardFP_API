import { Router } from "express";
import usuariosRouter from "./usuarios.js";
import categoriasRouter from "./categorias.js";
import cuentasRouter from "./cuentas.js";
import metasRouter from "./metas.js";
import reglasRouter from "./reglas.js";
import movimientosRouter from "./movimientos.js";
import presupuestosRouter from "./presupuestos.js";

const router = Router();

router.use("/usuarios", usuariosRouter);
router.use("/categorias", categoriasRouter);
router.use("/cuentas", cuentasRouter);
router.use("/metas", metasRouter);
router.use("/reglas", reglasRouter);
router.use("/movimientos", movimientosRouter);
router.use("/presupuestos", presupuestosRouter);
router.use((req, res) =>
  res.status(404).json({ message: "Recurso no encontrado" }),
);

export default router;
