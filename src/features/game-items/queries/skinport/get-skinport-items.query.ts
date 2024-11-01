import axios from "axios";
import { CachingQuery } from "../../../../lib/caching-query";
import {
  SkinportGameItemResType,
  GetSkinportGameItemsReqType,
} from "./get-skinport-game-items.dto";
import { GetGameItemsQueryType } from "../types";
import { key, provider, register, singleton } from "ts-ioc-container";
import { db } from "../../../../lib/db";

interface SkinportApiItem {
  market_hash_name: string;
  min_price: number;
  tradable: boolean;
}

@register(key(GetGameItemsQueryType))
@provider(singleton())
export class GetSkinportItemsQuery extends CachingQuery<
  GetSkinportGameItemsReqType,
  SkinportGameItemResType
> {
  // source endpoint is cached by 5 minutes.
  protected cacheTtl: number = 5 * 60;

  async doRequest(
    req: GetSkinportGameItemsReqType
  ): Promise<SkinportGameItemResType> {
    try {
      // Fetch tradable items
      const tradableResponse = await axios.get<SkinportApiItem[]>(
        "https://api.skinport.com/v1/items",
        {
          params: {
            app_id: "730",
            currency: "EUR",
            tradable: "1",
            ...req
          }
        }
      );

      // Fetch non-tradable items
      const nonTradableResponse = await axios.get<SkinportApiItem[]>(
        "https://api.skinport.com/v1/items",
        {
          params: {
            app_id: "730",
            currency: "EUR",
            tradable: "0",
            ...req
          }
        }
      );

      // Update local database
      const client = await db.getClient();
      try {
        await client.query('BEGIN');

        for (const item of [...tradableResponse.data, ...nonTradableResponse.data]) {
          await client.query(
            `INSERT INTO game_items (
              skinport_id,
              name,
              tradable_price,
              non_tradable_price,
              updated_at
            ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
            ON CONFLICT (skinport_id) DO UPDATE SET
              name = EXCLUDED.name,
              tradable_price = CASE 
                WHEN $3 IS NOT NULL THEN EXCLUDED.tradable_price 
                ELSE game_items.tradable_price 
              END,
              non_tradable_price = CASE 
                WHEN $4 IS NOT NULL THEN EXCLUDED.non_tradable_price 
                ELSE game_items.non_tradable_price 
              END,
              updated_at = CURRENT_TIMESTAMP`,
            [
              item.market_hash_name,
              item.market_hash_name,
              item.tradable === true ? item.min_price : null,
              item.tradable === false ? item.min_price : null
            ]
          );
        }

        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }

      // Return combined and transformed data
      return tradableResponse.data.map(item => ({
        ...item,
        tradable_price: item.min_price,
        non_tradable_price: nonTradableResponse.data.find(
          (ni: SkinportApiItem) => ni.market_hash_name === item.market_hash_name
        )?.min_price || null
      }));
    } catch (error) {
      console.error("Error fetching game items:", error);
      throw error;
    }
  }
}
