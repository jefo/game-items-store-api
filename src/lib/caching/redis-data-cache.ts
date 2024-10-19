import { createClient, RedisClientType } from "redis";
import { type DataCache } from "./data-cache";

export class RedisDataCache implements DataCache {
  public redis: RedisClientType;
  constructor() {
    this.redis = createClient({
      url: cfg.redisCacheUrl,
    });
    // TODO: logging
    this.redis.on("error", (err) => {
      console.error(err);
    });
    this.redis.on("connect", async () => {
      console.log("redis connected");
      await this.redis.flushAll();
    });
    this.redis.connect();
  }

  async get<TParams, TModel>(params: TParams) {
    const sParams = this.serializeParams(params);
    return this.redis.get<TModel>(sParams);
  }

  async set<TKey>(key: TKey, data: any, ttl?: number) {
    const sParams = this.serializeParams(key);
    await this.redis.set(sParams, data, ttl);
  }

  serializeParams<TKey>(params: TKey): string {
    if (typeof params === "string") {
      return params;
    }
    return JSON.stringify(params);
  }
}
