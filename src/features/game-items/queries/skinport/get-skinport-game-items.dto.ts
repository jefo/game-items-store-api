import { t } from "elysia";

export const GetSkinportGameItemsReqSchema = t.Object({
  currency: t.Optional(t.String()),
  sort: t.Optional(t.String())
});

export type GetSkinportGameItemsReqType = {
  currency?: string;
  sort?: string;
};

export type SkinportGameItemResType = Array<{
  market_hash_name: string;
  min_price: number;
  tradable: boolean;
  tradable_price: number | null;
  non_tradable_price: number | null;
}>;
