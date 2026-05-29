import { Router } from "express";
import * as controller from "../controllers/reglas.js";
import { auth } from "../middlewares/auth.js";
import { validarJSON } from "../middlewares/validador.js";
import { nuevaReglaSchema } from "../libs/zod.js";

const router = Router();

router.get("/", auth, controller.obtenerReglas);
router.post(
  "/nueva",
  auth,
  validarJSON(nuevaReglaSchema),
  controller.nuevaRegla,
);
router.delete("/:id", auth, controller.borrarRegla);

export default router;
