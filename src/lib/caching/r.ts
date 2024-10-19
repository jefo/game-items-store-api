import { RedisClientType, createClient } from "redis";
import { cfg, RedisServiceType } from "./cfg";

export interface IRedisService {
  get(key: string): Promise<any>;
  set(key: string, data: any, ttl?: number): Promise<void>;
}

export const RedisServiceSymbol = Symbol("RedisService");

export class RedisService implements IRedisService {
  public redis: RedisClientType;

  constructor(serviceName: RedisServiceType) {
    this.redis = createClient({
      url: cfg.redisCacheUrl,
    });
    this.redis.on("error", (err) => {
      console.log(`${serviceName}.url:`, cfg.redisCacheUrl);
      console.error(err);
    });
    this.redis.on("connect", async () => {
      console.log(`${serviceName} Connected`);
      await this.redis.flushAll();
    });
    this.redis.connect();
  }

  async get<T>(key: string) {
    const data = await this.redis.get(key);
    return data ? (JSON.parse(data) as T) : null;
  }

  scanIterator() {
    return this.redis.scanIterator();
  }

  async set(key: string, data: any, ttl: number = 3600) {
    // await this.redis.set(key, JSON.stringify(data), "EX", ttl);
    // TODO: ttl
    await this.redis.set(key, JSON.stringify(data));
  }
}
