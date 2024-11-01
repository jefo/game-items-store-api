export interface ICmd<TDto, TResult = void> {
  execute(dto: TDto): Promise<TResult>;
}

export interface IQuery<TDto, TResult> {
  execute(dto: TDto): Promise<TResult>;
}
