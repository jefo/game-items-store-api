import { Container, MetadataInjector } from "ts-ioc-container";
import { bindGameItemsModule } from "./features/game-items";

const container = new Container(new MetadataInjector());

bindGameItemsModule(container);

export { container };

