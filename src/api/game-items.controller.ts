import { Elysia } from "elysia";
import { container } from "../container";
import { IQuery } from "../lib/cqrs";
import {
  GetGameItemsQueryType,
  GetGameItemsReqSchema,
  type GameItemResType,
  type GetGameItemsReqType,
} from "../features/game-items";

export const gameItemsController = new Elysia({ prefix: "/game-items" })
  .state(
    "getGameItemsQuery",
    container.resolve<IQuery<GetGameItemsReqType, GameItemResType>>(
      GetGameItemsQueryType
    )
  )
  .get(
    "/",
    async ({ query, store: { getGameItemsQuery } }) =>
      getGameItemsQuery.execute(query),
    {
      query: GetGameItemsReqSchema,
    }
  );
