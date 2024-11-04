import "reflect-metadata";
import { Elysia } from "elysia";
import "./container";
import { gameItemsController } from "./api/game-items.controller";
import { authController } from "./api/auth.controller";
import { errorHandler } from "./lib/middleware/error-handler";
import { container } from "./container";

export const app = new Elysia()
  .get("/health", () => ({ status: "ok" }))
  .use(errorHandler)
  .use(authController(container))
  .use(gameItemsController(container));

export function startServer(port: number = 3000) {
  app.listen(port);
  console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
  );
  return app;
}

// Start the server if this file is run directly
if (import.meta.path === Bun.main) {
  startServer();
}
