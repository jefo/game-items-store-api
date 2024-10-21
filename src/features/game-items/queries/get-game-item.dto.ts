import { t } from "elysia";

export const GetGameItemsReqSchema = t.Object({
  
});

export const GameItemResSchema = t.Object({

});

export type GetSkinportGameItemsReqType = typeof GetGameItemsReqSchema.static;

export type SkinportGameItemResType = typeof GameItemResSchema.static;
