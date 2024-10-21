import { t } from "elysia";

export const GetSkinportGameItemsReqSchema = t.Object({
  app_id: t.Optional(
    t.String({
      description: "The app_id for the inventory`s game (default 730)",
    })
  ),
  currency: t.Optional(
    t.String({
      description:
        "The currency for pricing (default EUR - Supported: AUD, BRL, CAD, CHF, CNY, CZK, DKK, EUR, GBP, HRK, NOK, PLN, RUB, SEK, TRY, USD).",
    })
  ),
});

export const SkinportGameItemResSchema = t.Object({
  market_hash_name: t.String(),
  currency: t.String(),
  suggested_price: t.Number(),
  item_page: t.String({ format: "uri" }),
  market_page: t.String({ format: "uri" }),
  min_price: t.Optional(t.Number()),
  max_price: t.Optional(t.Number()),
  mean_price: t.Optional(t.Number()),
  quantity: t.Number(),
  created_at: t.Integer(),
  updated_at: t.Integer(),
});

export type GetSkinportGameItemsReqType = typeof GetSkinportGameItemsReqSchema.static;

export type SkinportGameItemResType = typeof SkinportGameItemResSchema.static;
