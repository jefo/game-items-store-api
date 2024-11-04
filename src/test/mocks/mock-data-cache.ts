import { DataCache } from "../../lib/caching/data-cache";
import { key, provider, register, singleton } from "ts-ioc-container";
import { DataCacheToken } from "../../lib/caching/tokens";

@register(key(DataCacheToken))
@provider(singleton())
export class MockDataCache implements DataCache {
    private cache: Map<string, string> = new Map();

    async get<TParams, TModel>(params: TParams): Promise<TModel | null> {
        const key = JSON.stringify(params);
        const value = this.cache.get(key);
        return value ? JSON.parse(value) : null;
    }

    async set<TParams, TModel>(params: TParams, data: TModel, ttl?: number): Promise<void> {
        const key = JSON.stringify(params);
        this.cache.set(key, JSON.stringify(data));
    }

    async del<TParams>(params: TParams): Promise<void> {
        const key = JSON.stringify(params);
        this.cache.delete(key);
    }

    async clear(): Promise<void> {
        this.cache.clear();
    }

    async disconnect(): Promise<void> {
        // No-op for mock
    }
}
