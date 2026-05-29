import { Router } from "express";
import { auth } from "../middlewares/auth.js";
import * as controller from "../controllers/presupuestos.js";
import { presupuestoSchema } from "../libs/zod.js";
import { validarJSON } from "../middlewares/validador.js";

const router = Router();

router.get("/", auth, controller.obtenerPresupuestos);
router.post(
  "/nuevo",
  auth,
  validarJSON(presupuestoSchema),
  controller.nuevoPresupuesto,
);
router.patch(
  "/:id",
  auth,
  validarJSON(presupuestoSchema),
  controller.actualizarPresupuesto,
);
router.delete("/:id", auth, controller.borrarPresupuesto);

export default router;
