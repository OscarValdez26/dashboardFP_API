import express from "express";
import cors from "cors";
import morgan from "morgan";
import router from "./routes/routes.index.js";
import cookieParser from "cookie-parser";
import { errorHandler } from "./libs/errorHandler.js";
import "dotenv/config";

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(
  cors({
    origin: [process.env.FRONTEND_URL!],
    methods: ["GET", "POST", "DELETE", "PATCH"],
    credentials: true,
  }),
);
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use("/api", router);
app.use(errorHandler);

export default app;
