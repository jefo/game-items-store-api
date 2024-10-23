import 'reflect-metadata';
import { IContainer, Registration as R } from "ts-ioc-container";
import { BuyGameItemCmdType } from "./commands/types";
import { GetGameItemsQueryType, GetSkinportItemsQuery } from "./queries";
import { BuyGameItemCmd } from './commands';

export function bindGameItemsModule(container: IContainer) {
  container.add(R.fromClass(BuyGameItemCmd).to(BuyGameItemCmdType));
  container.add(R.fromClass(GetSkinportItemsQuery).to(GetGameItemsQueryType));
}

export * from "./queries";
export * from "./commands";
