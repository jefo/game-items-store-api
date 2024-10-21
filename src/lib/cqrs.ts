export interface IWithId {
  id: string;
}

export interface IQuery<TParams, TResult> {
  execute(params: TParams): Promise<TResult | null>;
}

export interface ICmd<TParams> {
  execute(dto: TParams): Promise<void>;
}
