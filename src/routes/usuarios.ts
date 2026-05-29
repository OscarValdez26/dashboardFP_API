import { Router } from "express";
import * as controller from "../controllers/usuarios.js";
import { validarJSON } from "../middlewares/validador.js";
import { loginSchema, usuarioSchema } from "../libs/zod.js";
import { auth } from "../middlewares/auth.js";
import { rateLimiter } from "../middlewares/rateLimit.js";

const router = Router();

router.get("/all", controller.obtenerUsuarios);
router.get("/:id", controller.obtenerUsuario);
router.post(
  "/register",
  validarJSON(usuarioSchema),
  controller.registrarUsuario,
);
router.post(
  "/login",
  validarJSON(loginSchema),
  rateLimiter,
  controller.loginUsuario,
);
router.post("/logout", auth, controller.logout);
router.post("/refresh", controller.refresh);
router.post("/forgot-password", controller.forgotPassword);
router.post("/reset-password", controller.resetPassword);
router.post("/verificar-email", controller.verificarEmail);

export default router;
