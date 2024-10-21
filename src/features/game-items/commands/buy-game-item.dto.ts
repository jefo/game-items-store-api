import { t } from "elysia";

export const BuyGemeItemReqSchema = t.Object({
  userId: t.String({ description: "ID of the buyer" }),
  itemId: t.String({ description: "The game item ID to buy" }),
});

export type BuyGameItemReqType = typeof BuyGemeItemReqSchema.static;
