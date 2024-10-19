export interface DataCache {
    get<TParams, TModel>(params: TParams): Promise<TModel | null>;
    set<TParams, TModel>(params: TParams, data: TModel, ttl?: number): Promise<void>;
    serializeParams<TParams>(params: TParams): string;
}
export const DataCacheSymbol = Symbol.for('DataCache');