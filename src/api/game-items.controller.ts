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
import { Container } from "ts-ioc-container";
import { ValidationError } from "../lib/errors";

export const gameItemsController = (container: Container) =>
  new Elysia({ prefix: "/api/store" })
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
      async ({ query, getGameItemsQuery, set }) => {
        try {
          const items = await getGameItemsQuery.execute(query);
          return {
            status: "success",
            data: items,
          };
        } catch (error) {
          if (error instanceof ValidationError) {
            set.status = 400;
            return {
              status: "error",
              error: {
                code: "VALIDATION_ERROR",
                message: error.message,
              },
            };
          }
          throw error;
        }
      },
      {
        query: GetSkinportGameItemsReqSchema,
      }
    )
    .post(
      "/purchases",
      async ({ body, buyGameItemCmd, user, set }) => {
        try {
          const result = await buyGameItemCmd.execute({
            ...body,
            userId: user!.id,
          });

          return {
            status: "success",
            data: result,
          };
        } catch (error) {
          if (error instanceof Error) {
            set.status = 400;
            return {
              status: "error",
              error: {
                code: "PURCHASE_ERROR",
                message: error.message,
              },
            };
          }
          throw error;
        }
      },
      {
        body: BuyGameItemReqSchema,
      }
    );
