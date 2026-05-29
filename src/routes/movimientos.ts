import { Router } from "express";
import * as controller from "../controllers/movimientos.js";
import { auth } from "../middlewares/auth.js";
import { validarJSON } from "../middlewares/validador.js";
import { nuevoMovimientoSchema, periodoSchema } from "../libs/zod.js";

const router = Router();

router.get("/", auth, controller.obtenerMovimientos);
router.post(
  "/nuevo",
  auth,
  validarJSON(nuevoMovimientoSchema),
  controller.nuevoMovimiento,
);
router.get("/recientes", auth, controller.ultimosMovimientos);
router.get("/gastos", auth, controller.gastosMes);
router.post(
  "/periodo",
  auth,
  validarJSON(periodoSchema),
  controller.movimientosPeriodo,
);

export default router;
