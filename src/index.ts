import "reflect-metadata";
import { Elysia } from "elysia";
import "./container";
import { gameItemsController } from "./api/game-items.controller";
import { authController } from "./api/auth.controller";
import { auth } from "./lib/middleware/auth";
import { errorHandler } from "./lib/middleware/error-handler";

const app = new Elysia()
  .use(errorHandler)
  .use(authController)
  .use(gameItemsController)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
