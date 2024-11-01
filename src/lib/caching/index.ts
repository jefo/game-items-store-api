import 'reflect-metadata';
import { IContainer, Registration as R } from "ts-ioc-container";
import { DataCacheToken } from "./tokens";
import { RedisDataCache } from "./redis-data-cache";

export function bindCachingModule(container: IContainer) {
  container.add(R.fromClass(RedisDataCache).to(DataCacheToken));
}

export * from "./data-cache";
export * from "./redis-data-cache";
export * from "./tokens";
