import "reflect-metadata";
import { beforeAll, beforeEach, afterAll } from "bun:test";
import { DataCache } from "../lib/caching/data-cache";
import { Pool } from "pg";
import { DataCacheToken } from "../lib/caching";
import { hashPassword } from "../lib/auth/pwd.utils";

declare global {
  var testDb: Pool;
  var testCache: DataCache;
}

let cleanup: (() => Promise<void>) | undefined;

beforeAll(async () => {
  // Initialize test environment
  const { setupTestEnvironment } = await import("./setup-test-env");
  const env = await setupTestEnvironment();

  globalThis.testDb = env.db;
  globalThis.testCache = env.container.resolve<DataCache>(DataCacheToken);
  cleanup = env.cleanup;
});

beforeEach(async () => {
  console.log('Setting up test data...');
  
  // Clean database tables
  await testDb.query("TRUNCATE users, game_items, purchases CASCADE");
  console.log('Tables truncated');

  // Clean Redis cache
  await testCache.clear();
  console.log('Cache cleared');

  // Generate password hash
  const passwordHash = await hashPassword('password123');
  console.log('Generated password hash:', passwordHash);

  // Insert test data
  const userResult = await testDb.query(`
    INSERT INTO users (username, password_hash, balance) 
    VALUES 
      ('testuser', $1, 1000.00),
      ('pooruser', $1, 0.00)
    RETURNING id, username, password_hash
  `, [passwordHash]);
  console.log('Inserted users:', userResult.rows);

  const itemResult = await testDb.query(`
    INSERT INTO game_items (skinport_id, name, tradable_price, non_tradable_price) 
    VALUES 
      ('item1', 'AWP | Dragon Lore', 100.00, 90.00),
      ('item2', 'AK-47 | Wild Lotus', 50.00, 45.00)
    RETURNING id, name
  `);
  console.log('Inserted items:', itemResult.rows);
});

afterAll(async () => {
  if (cleanup) {
    await cleanup();
  }
});
