import { Elysia, t } from "elysia";
import { container } from "../container";
import { ICmd, IQuery } from "../lib/cqrs";
import {
  GetGameItemsQueryType,
  GetSkinportGameItemsReqSchema,
  type SkinportGameItemResType,
  type GetSkinportGameItemsReqType,
  BuyGameItemCmdType,
} from "../features/game-items";
import {
  BuyGameItemReqType,
  BuyGameItemReqSchema,
} from "../features/game-items/commands/buy-game-item.dto";
import { auth } from "../lib/middleware/auth";

export const gameItemsController = new Elysia({ prefix: "/api/store" })
  .use(auth())
  .decorate(
    "getGameItemsQuery",
    container.resolve<
      IQuery<GetSkinportGameItemsReqType, SkinportGameItemResType>
    >(GetGameItemsQueryType)
  )
  .decorate(
    "buyGameItemCmd",
    container.resolve<ICmd<BuyGameItemReqType>>(BuyGameItemCmdType)
  )
  .get(
    "/",
    async ({ query, getGameItemsQuery }) => {
      const items = await getGameItemsQuery.execute(query);
      return {
        status: "success",
        data: items,
      };
    },
    {
      query: GetSkinportGameItemsReqSchema,
    }
  )
  .post(
    "/purchases",
    async ({ body, buyGameItemCmd, user }) => {
      const result = await buyGameItemCmd.execute({
        ...body,
        userId: user!.id,
      });

      return {
        status: "success",
        data: result,
      };
    },
    {
      body: BuyGameItemReqSchema,
    }
  );
