import axios from "axios";
import { CachingQuery } from "../../../../lib/caching-query";
import {
  SkinportGameItemResType as SkinportGameItemResType,
  GetSkinportGameItemsReqType as GetSkinportGameItemsReqType,
} from "./get-skinport-game-items.dto";
import { GetGameItemsQueryType } from "../types";
import { key, provider, register, singleton } from "ts-ioc-container";

@register(key(GetGameItemsQueryType))
@provider(singleton())
export class GetSkinportItemsQuery extends CachingQuery<
  GetSkinportGameItemsReqType,
  SkinportGameItemResType
> {
  // source endpoint is cached by 5 minutes.
  protected cacheTtl: number = 5000 * 60;

  async doRequest(
    req: GetSkinportGameItemsReqType
  ): Promise<SkinportGameItemResType> {
    try {
      const response = await axios.get<SkinportGameItemResType>(
        "https://api.skinport.com/v1/items?app_id=730&currency=EUR&tradable=0",
        {
          params: req,
        }
      );
      return response.data;
    } catch (error) {
      // Handle or log the error
      console.error("Error fetching game items:", error);
      throw error;
    }
  }
}
