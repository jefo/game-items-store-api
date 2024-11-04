# Game Items Store API

A high-performance backend API for managing game item transactions, built with modern architectural patterns and best practices.

## Локальная разработка

### Предварительные требования

- Bun runtime
- Docker и Docker Compose
- Git

### Установка и запуск

1. Клонируйте репозиторий:
```bash
git clone <repository-url>
cd game-items-store-api
```

2. Установите зависимости:
```bash
bun install
```

3. Создайте файл `.env` в корне проекта:
```env
NODE_ENV=development
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=postgres
REDIS_URL=redis://localhost:6379
```

4. Запустите инфраструктуру:
```bash
docker-compose up -d
```

5. Примените миграции:
```bash
bun run migrate up
```

6. Запустите сервер разработки:
```bash
bun run dev
```

### Тестирование

```bash
bun test
```

## Architecture Overview

### Core Patterns & Design Decisions

1. **CQRS (Command Query Responsibility Segregation)**
   - Separate command and query models for better scalability and maintainability
   - Commands handle state mutations (e.g., purchasing items)
   - Queries handle data retrieval with caching support
   - Clear separation of write and read operations improves performance optimization

2. **Clean Architecture**
   - Feature-based folder structure for better code organization
   - Clear separation of concerns between business logic and infrastructure
   - Domain-driven design principles in model organization
   - Highly testable and maintainable code structure

3. **Robust Transaction Handling**
   - Pessimistic locking for critical operations (FOR UPDATE)
   - ACID compliance for all financial transactions
   - Proper error handling and transaction rollbacks
   - Race condition prevention in concurrent operations

4. **Caching Strategy**
   - Redis-based caching layer for high-performance data retrieval
   - Generic cache interface allowing easy adapter swapping
   - Configurable TTL for different data types
   - Optimized for read-heavy operations

5. **Dependency Injection**
   - IoC container for better dependency management
   - Decorator-based service registration
   - Singleton lifecycle management
   - Easy testing and component swapping

### Technical Stack

- **Runtime**: Bun (high-performance JavaScript runtime)
- **Framework**: Elysia (modern, type-safe web framework)
- **Database**: PostgreSQL (reliable, ACID-compliant database)
- **Caching**: Redis (in-memory data store)
- **Language**: TypeScript (type safety and modern features)
- **Container**: Docker (containerization and deployment)
- **Migrations**: node-pg-migrate (database version control)

## Project Structure

```
src/
├── api/                 # API Controllers
├── features/           # Feature modules
│   └── game-items/    # Game items feature
│       ├── commands/  # Write operations
│       └── queries/   # Read operations
├── lib/               # Core infrastructure
│   ├── caching/      # Caching implementation
│   ├── cqrs/         # CQRS infrastructure
│   └── db/           # Database models and connection
```

## Key Features

1. **Atomic Transactions**
   - All purchase operations are atomic
   - Prevents race conditions in concurrent purchases
   - Maintains data consistency in high-load scenarios

2. **Type Safety**
   - Full TypeScript implementation
   - Runtime type validation
   - Compile-time type checking

3. **Performance Optimization**
   - Redis caching for frequently accessed data
   - Optimized database queries with proper indexing
   - Efficient connection pooling

4. **Scalability**
   - Containerized deployment ready
   - Stateless architecture
   - Easy horizontal scaling

5. **Maintainability**
   - Clear separation of concerns
   - Consistent coding patterns
   - Well-documented architecture
   - Easy to test and modify

## Infrastructure Requirements

- PostgreSQL 13+
- Redis 6+
- Bun runtime
