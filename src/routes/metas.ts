import { Router } from "express";
import * as controller from "../controllers/metas.js";
import { auth } from "../middlewares/auth.js";
import { validarJSON } from "../middlewares/validador.js";
import { nuevaMetaSchema, updateMetaSchema } from "../libs/zod.js";

const router = Router();

router.get("/", auth, controller.obtenerMetas);
router.post("/nueva", auth, validarJSON(nuevaMetaSchema), controller.crearMeta);
router.delete("/:id", auth, controller.borrarMeta);
router.patch(
  "/update/:id",
  auth,
  validarJSON(updateMetaSchema),
  controller.actualizarMeta,
);

export default router;
