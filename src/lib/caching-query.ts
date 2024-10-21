import { RedisDataCache, type DataCache } from "./caching";
import { IQuery } from "./cqrs";

export abstract class CachingQuery<TParams, TDto>
  implements IQuery<TParams, TDto>
{
  // TODO: autowire with config
  protected cacheKey = "";
  protected cacheTtl = 3600;

  // not injected for the sake of dev experience
  private readonly cache: DataCache = new RedisDataCache();

  async execute(query: TParams): Promise<TDto> {
    if (!this.cacheKey && !query) {
      throw new Error(
        "If query has no params, you should override CachingQuery.cacheKey in your class."
      );
    }
    const key = (this.cacheKey as any) || query;
    const cachedData = await this.cache.get<TParams, TDto>(key);
    if (cachedData) {
      return cachedData;
    }
    const data = await this.doRequest(query);
    this.cache.set(key, data, this.cacheTtl);
    return data;
  }

  protected abstract doRequest(query: TParams): Promise<TDto>;
}
