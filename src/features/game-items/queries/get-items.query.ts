import axios from "axios";
import { CachingQuery } from "../../../lib/caching-query";
import { GameItemResType, GetGameItemsReqType } from "./get-game-items.dto";

export class GetItemsQuery
  extends CachingQuery<GetGameItemsReqType, GameItemResType>
{
  // source endpoint is cached by 5 minutes.
  protected cacheTtl: number = 5000 * 60;

  async doRequest(req: GetGameItemsReqType): Promise<GameItemResType> {
    try {
      const response = await axios.get<GameItemResType>(
        "https://api.skinport.com/v1/items?app_id=730&currency=EUR&tradable=1",
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
