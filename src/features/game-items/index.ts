import 'reflect-metadata';
import { IContainer, Registration as R } from "ts-ioc-container";
import { BuyGameItemCmd } from "./commands/buy-game-item.cmd";
import { BuyGameItemCmdType } from "./commands/types";
import { GetGameItemsQueryType, GetSkinportItemsQuery } from "./queries";

export function bindGameItemsModule(container: IContainer) {
  container.add(R.fromClass(BuyGameItemCmd).to(BuyGameItemCmdType));
  container.add(R.fromClass(GetSkinportItemsQuery).to(GetGameItemsQueryType));
}

export * from "./queries";
export * from "./commands";
