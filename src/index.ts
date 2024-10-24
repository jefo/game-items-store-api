import { Elysia } from "elysia";
import "./container";
import { gameItemsController } from "./api/game-items.controller";

const app = new Elysia()
  .get("/", () => "Hello Elysia")
  .use(gameItemsController)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
