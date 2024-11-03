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
import { AuthUser, createAuthMiddleware } from "../lib/middleware/auth";

interface StoreContext {
  query: GetSkinportGameItemsReqType;
  store: {
    getGameItemsQuery: IQuery<GetSkinportGameItemsReqType, SkinportGameItemResType>;
  };
  user: AuthUser;
  set: { status: number };
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
  .use(createAuthMiddleware(container))
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
  .onError(({ error, set }) => {
    if (error instanceof Error && error.message === 'Unauthorized') {
      set.status = 401;
      return {
        status: 'error',
        error: 'Unauthorized'
      };
    }
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  })
  .get(
    "/",
    async ({ query, store: { getGameItemsQuery }, user, set }: StoreContext) => {
      if (!user) {
        set.status = 401;
        return {
          status: 'error',
          error: 'Unauthorized'
        };
      }

      try {
        const items = await getGameItemsQuery.execute(query);
        return {
          status: 'success',
          data: items
        };
      } catch (error) {
        set.status = 500;
        return {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
      }
    },
    {
      query: GetSkinportGameItemsReqSchema,
    }
  )
  .post(
    "/purchases",
    async ({ body, store: { buyGameItemCmd }, user, set }: PurchaseContext) => {
      if (!user) {
        set.status = 401;
        return {
          status: 'error',
          error: 'Unauthorized'
        };
      }

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
