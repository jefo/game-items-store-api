import { Elysia } from "elysia";
import { container } from "@/container";
import { ICmd, IQuery } from "@/lib/cqrs";
import {
  GetGameItemsQueryType,
  GetSkinportGameItemsReqSchema,
  type SkinportGameItemResType,
  type GetSkinportGameItemsReqType,
  BuyGameItemCmdType,
} from "@/features/game-items";
import {
  BuyGameItemReqType,
  BuyGemeItemReqSchema as BuyGameItemReqSchema,
} from "@/features/game-items/commands/buy-game-item.dto";

export const gameItemsController = new Elysia({ prefix: "/game-items" })
  .state(
    "getGameItemsQuery",
    container.resolve<
      IQuery<GetSkinportGameItemsReqType, SkinportGameItemResType>
    >(GetGameItemsQueryType)
  )
  .state(
    "buyGameItemCmd",
    container.resolve<ICmd<BuyGameItemReqType>>(BuyGameItemCmdType)
  )
  .get(
    "/",
    async ({ query, store: { getGameItemsQuery } }) =>
      getGameItemsQuery.execute(query),
    {
      query: GetSkinportGameItemsReqSchema,
    }
  )
  .post(
    "/purchase",
    async ({ body, store: { buyGameItemCmd } }) => buyGameItemCmd.execute(body),
    {
      body: BuyGameItemReqSchema,
    }
  );
