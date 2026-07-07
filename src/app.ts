import express, { Application } from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";

import { env } from "./config/env";
import apiRouter from "./routes/index";
import { swaggerSpec } from "./config/swagger";
import {
  globalErrorHandler,
  notFoundHandler,
} from "./middlewares/errorHandler";

const app: Application = express();

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Mini ERP API is running",
  });
});

app.use("/api/v1", apiRouter);

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
