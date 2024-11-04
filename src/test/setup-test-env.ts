import "reflect-metadata";
import { Elysia } from "elysia";
import { Pool } from "pg";
import { Container, MetadataInjector, Registration as R } from "ts-ioc-container";
import { DataCache } from "../lib/caching/data-cache";
import { DataCacheToken } from "../lib/caching/tokens";
import { authController } from "../api/auth.controller";
import { gameItemsController } from "../api/game-items.controller";
import { errorHandler } from "../lib/middleware/error-handler";
import { bindAuthModule } from "../features/auth";
import { bindGameItemsModule } from "../features/game-items";
import { hashPassword } from "../lib/auth/pwd.utils";
import { MockDataCache } from "./mocks/mock-data-cache";
import { MockSessionManager } from "./mocks/mock-session-manager";
import { SessionManagerType } from "../features/auth";
import { ISessionManager } from "../lib/auth/redis-session";

const createTestDb = async () => {
  console.log('Creating test database connection...');
  
  // First connect to default database to create test database
  const defaultPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    database: 'postgres',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
  });

  try {
    console.log('Creating test database if it doesn\'t exist...');
    // Create test database if it doesn't exist
    await defaultPool.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'game_items_store_test') THEN
          PERFORM dblink_exec('', 'CREATE DATABASE game_items_store_test');
        END IF;
      END $$;
    `);
    console.log('Test database created successfully');
  } catch (error) {
    // Ignore error if database already exists
    const pgError = error as { code?: string };
    if (pgError.code !== '42P04') { // 42P04 is the error code for "database already exists"
      console.error('Error creating test database:', error);
      throw error;
    }
    console.log('Test database already exists');
  } finally {
    await defaultPool.end();
  }

  // Connect to test database
  console.log('Connecting to test database...');
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    database: 'game_items_store_test',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    max: 1 // Limit to one connection to avoid pool exhaustion during tests
  });

  // Clean and recreate tables
  console.log('Creating database schema...');
  await pool.query(`
    DROP TABLE IF EXISTS purchases CASCADE;
    DROP TABLE IF EXISTS game_items CASCADE;
    DROP TABLE IF EXISTS users CASCADE;

    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE game_items (
      id SERIAL PRIMARY KEY,
      skinport_id VARCHAR(255) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      tradable_price DECIMAL(10, 2),
      non_tradable_price DECIMAL(10, 2),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE purchases (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      item_id INTEGER REFERENCES game_items(id),
      price DECIMAL(10, 2) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      is_tradable BOOLEAN NOT NULL
    );
  `);
  console.log('Database schema created successfully');

  // Insert test data
  console.log('Inserting test data...');
  const passwordHash = await hashPassword('password123');
  console.log('Generated password hash:', passwordHash);

  const userResult = await pool.query(`
    INSERT INTO users (username, password_hash, balance) 
    VALUES 
      ('testuser', $1, 1000.00),
      ('pooruser', $1, 0.00)
    RETURNING id, username, balance
  `, [passwordHash]);
  console.log('Inserted users:', userResult.rows);

  const itemResult = await pool.query(`
    INSERT INTO game_items (skinport_id, name, tradable_price, non_tradable_price) 
    VALUES 
      ('item1', 'AWP | Dragon Lore', 100.00, 90.00),
      ('item2', 'AK-47 | Wild Lotus', 50.00, 45.00)
    RETURNING id, name
  `);
  console.log('Inserted items:', itemResult.rows);

  return pool;
};

export const setupTestEnvironment = async () => {
  console.log('Setting up test environment...');
  
  // Create test database connection
  const db = await createTestDb();

  // Create test container with dependencies
  console.log('Creating dependency container...');
  const container = new Container(new MetadataInjector());
  
  // Bind database
  container.add(R.fromValue(db).to("DbPool"));
  
  // Bind mock cache instead of Redis
  container.add(R.fromClass(MockDataCache).to(DataCacheToken));

  // Bind mock session manager
  container.add(R.fromClass(MockSessionManager).to(SessionManagerType));

  // Bind feature modules
  bindAuthModule(container);
  bindGameItemsModule(container);

  // Create test app instance with container
  console.log('Creating test app instance...');
  const app = new Elysia()
    .use(errorHandler) // Register error handler first
    .get("/health", () => ({ status: "ok" }))
    .use(authController(container))
    .use(gameItemsController(container));

  // Start server and verify it's running
  console.log('Starting test server...');
  app.listen(3000);
  
  // Wait for server to be ready
  await new Promise(resolve => setTimeout(resolve, 100));
  console.log('Test environment setup complete');

  return {
    db,
    container,
    app,
    cleanup: async () => {
      console.log('Cleaning up test environment...');
      const cache = container.resolve<DataCache>(DataCacheToken);
      await cache.clear();
      await cache.disconnect();
      app.stop();
      await db.end();
      console.log('Cleanup complete');
    },
  };
};
