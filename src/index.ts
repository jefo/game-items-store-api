import 'reflect-metadata';
import { Elysia } from "elysia";
import "./container";
import { gameItemsController } from "./api/game-items.controller";
import { authController } from "./api/auth.controller";
import { authMiddleware } from "./lib/middleware/auth";
import { rateLimit } from "./lib/middleware/rate-limit";
import { csrfProtection } from "./lib/middleware/csrf";
import { errorHandler } from "./lib/middleware/error-handler";

const app = new Elysia()
  .use(errorHandler)  // Apply error handler first to catch all errors
  .use(rateLimit)
  .use(csrfProtection)
  .use(authMiddleware)
  .use(authController)
  .use(gameItemsController)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
