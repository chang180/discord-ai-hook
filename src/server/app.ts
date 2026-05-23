import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { AppConfig } from "../config.js";
import type { ArticlesRepo } from "../storage/articlesRepo.js";
import { createRoutes } from "./routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp(config: AppConfig, repo: ArticlesRepo): express.Application {
  const app = express();
  app.use(express.json());

  if (config.ENABLE_TEST_UI) {
    const publicDir = path.join(__dirname, "../../public");
    app.use(express.static(publicDir));
  }

  app.use("/api", createRoutes(config, repo));

  return app;
}
