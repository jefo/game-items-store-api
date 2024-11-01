import 'reflect-metadata';
import { Container } from 'ts-ioc-container';
import { bindGameItemsModule } from './features/game-items';
import { bindAuthModule } from './features/auth';
import { bindCachingModule } from './lib/caching';
import { bindDbModule } from './lib/db';

// Create container and bind all modules
const container = new Container();

// Initialize container with required modules in correct order
bindDbModule(container);
bindCachingModule(container);
bindAuthModule(container);
bindGameItemsModule(container);

export { container };
