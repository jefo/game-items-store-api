import { IUpdateCmd } from "../../../lib/cqrs";

export class BuyGameItemCmd implements IUpdateCmd<{ id: string }> {
  execute(): Promise<void> {
    return Promise.resolve();
  }
}
