import { createClient, RedisClientType } from "redis";
import { type DataCache } from "./data-cache";
import { cfg } from "../cfg";

export class RedisDataCache implements DataCache {
  public redis: RedisClientType;
  constructor() {
    this.redis = createClient({
      url: cfg.redis.url,
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
    return this.redis
      .get(sParams)
      .then((str) => (str ? (JSON.parse(str) as TModel) : null));
  }

  async set<TKey>(key: TKey, data: any, ttl?: number) {
    const sParams = this.serializeParams(key);
    const serializedData = JSON.stringify(data);
    if (ttl) {
      this.redis.setEx(sParams, ttl, serializedData);
    } else {
      this.redis.set(sParams, serializedData);
    }
  }

  private serializeParams<TKey>(params: TKey): string {
    if (typeof params === "string") {
      return params;
    }
    return JSON.stringify(params);
  }
}
