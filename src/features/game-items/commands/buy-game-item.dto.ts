import { t } from "elysia";

export const BuyGameItemReqSchema = t.Object({
  itemId: t.Number(),
  isTradable: t.Boolean()
});

export type BuyGameItemReqType = {
  userId: number;
  itemId: number;
  isTradable: boolean;
};
