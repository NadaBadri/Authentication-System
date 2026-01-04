import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./utils/env.js";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import healthRoutes from "./routes/health.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.clientOrigin,
      credentials: true
    })
  );
  app.use(express.json());
  app.use(cookieParser());

  app.use("/api", healthRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/admin", adminRoutes);

  app.use((_req, res) => res.status(404).json({ error: "Not found" }));

  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  });

  return app;
}

