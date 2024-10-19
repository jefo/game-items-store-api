export interface IWithId {
  id: string;
}

export interface IQuery<TParams, TResult> {
  execute(params: TParams): Promise<TResult | null>;
}

export interface IUpdateCmd<TDto extends IWithId> {
  execute(dto: TDto): Promise<void>;
}
