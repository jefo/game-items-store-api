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
import { AuthUser } from "../lib/middleware/auth";

interface StoreContext {
  query: GetSkinportGameItemsReqType;
  store: {
    getGameItemsQuery: IQuery<GetSkinportGameItemsReqType, SkinportGameItemResType>;
  };
}

interface PurchaseContext {
  body: Omit<BuyGameItemReqType, 'userId'>;
  user: AuthUser;
  set: { status: number };
  store: {
    buyGameItemCmd: ICmd<BuyGameItemReqType>;
  };
}

export const gameItemsController = new Elysia({ prefix: "/api/store" })
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
    async ({ query, store: { getGameItemsQuery } }: StoreContext) => {
      const items = await getGameItemsQuery.execute(query);
      return {
        status: 'success',
        data: items
      };
    },
    {
      query: GetSkinportGameItemsReqSchema,
    }
  )
  .post(
    "/purchases",
    async ({ body, store: { buyGameItemCmd }, user, set }: PurchaseContext) => {
      try {
        const result = await buyGameItemCmd.execute({
          ...body,
          userId: user.id
        });

        return {
          status: 'success',
          data: result
        };
      } catch (error) {
        set.status = 400;
        return {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
      }
    },
    {
      body: BuyGameItemReqSchema,
    }
  );
