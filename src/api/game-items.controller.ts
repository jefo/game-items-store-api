import { Elysia } from "elysia";
import { container } from "../container";
import { IQuery } from "../lib/cqrs";
import {
  GetGameItemsQueryType,
  GetSkinportGameItemsReqSchema,
  type SkinportGameItemResType,
  type GetSkinportGameItemsReqType,
} from "../features/game-items";

export const gameItemsController = new Elysia({ prefix: "/game-items" })
  .state(
    "getGameItemsQuery",
    container.resolve<IQuery<GetSkinportGameItemsReqType, SkinportGameItemResType>>(
      GetGameItemsQueryType
    )
  )
  .get(
    "/",
    async ({ query, store: { getGameItemsQuery } }) =>
      getGameItemsQuery.execute(query),
    {
      query: GetSkinportGameItemsReqSchema,
    }
  );
