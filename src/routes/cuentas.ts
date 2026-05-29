import { Router } from "express";
import * as controller from "../controllers/cuentas.js";
import { auth } from "../middlewares/auth.js";
import { validarJSON } from "../middlewares/validador.js";
import { cuentaSchema, movimientoCuentaSchema } from "../libs/zod.js";

const router = Router();

router.get("/", auth, controller.obtenerCuentas);
router.get("/historial", auth, controller.obtenerHistorial);
router.post("/nueva", auth, validarJSON(cuentaSchema), controller.crearCuenta);
router.post("/generate/:id", auth, controller.generarArqueo);
router.delete("/:id", auth, controller.borrarCuenta);

export default router;
