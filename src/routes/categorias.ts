import { Router } from "express";
import * as controller from "../controllers/categorias.js";
import { auth } from "../middlewares/auth.js";

const router = Router();

router.get("/", auth, controller.obtenerCategorias);
router.get("/:id", auth, controller.obtenerCategoria);

export default router;
