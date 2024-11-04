import { key, provider, register, singleton } from 'ts-ioc-container';
import { DataCache } from './data-cache';
import { DataCacheToken } from './tokens';
import { createClient } from 'redis';
import { cfg } from '../cfg';

@register(key(DataCacheToken))
@provider(singleton())
export class RedisDataCache implements DataCache {
    private client;

    constructor() {
        this.client = createClient({
            url: cfg.redis.url
        });
        this.client.connect();
    }

    async get<TParams, TModel>(params: TParams): Promise<TModel | null> {
        const key = JSON.stringify(params);
        const data = await this.client.get(key);
        return data ? JSON.parse(data) : null;
    }

    async set<TParams, TModel>(params: TParams, data: TModel, ttl?: number): Promise<void> {
        const key = JSON.stringify(params);
        if (ttl) {
            await this.client.setEx(key, ttl, JSON.stringify(data));
        } else {
            await this.client.set(key, JSON.stringify(data));
        }
    }

    async clear(): Promise<void> {
        await this.client.flushDb();
    }

    async disconnect(): Promise<void> {
        await this.client.disconnect();
    }
}
