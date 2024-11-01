import { beforeAll, afterAll } from "bun:test";
import { db } from '../lib/db';
import { createClient } from 'redis';
import { cfg } from '../lib/cfg';

beforeAll(async () => {
    // Connect to Redis
    const redis = createClient({ url: cfg.redis.url });
    await redis.connect();
    await redis.flushAll();
    await redis.quit();

    // Setup database
    await db.query(`
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
});

afterAll(async () => {
    await db.query('DROP TABLE IF EXISTS purchases, game_items, users CASCADE');
    
    // Close the pool
    const pool = (db as any).pool;
    if (pool) {
        await pool.end();
    }
});
