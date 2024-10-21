import axios from "axios";
import { CachingQuery } from "../../../lib/caching-query";

export class GetGameItemByIdQuery extends CachingQuery<
  string,
  { id: string }
> {
  // source endpoint is cached by 5 minutes.
  protected cacheTtl: number = 5000 * 60;

  async doRequest(req: string): Promise<{ id: string }> {
    return { id: "1" };
  }
}
