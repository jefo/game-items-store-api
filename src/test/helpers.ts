import { db } from '../lib/db';
import { PasswordManager } from '../lib/auth/password';
import { Elysia } from 'elysia';
import { authController } from '../api/auth.controller';
import { gameItemsController } from '../api/game-items.controller';
import { authMiddleware } from '../lib/middleware/auth';
import { rateLimit } from '../lib/middleware/rate-limit';
import { csrfProtection } from '../lib/middleware/csrf';

export async function setupTestDatabase() {
    await db.query('BEGIN');
    
    // Clear existing data
    await db.query('TRUNCATE users, game_items, purchases CASCADE');
    
    // Create test user
    const passwordHash = await PasswordManager.hash('testpass123');
    await db.query(
        `INSERT INTO users (username, password_hash, balance) 
         VALUES ($1, $2, $3) 
         RETURNING id`,
        ['testuser', passwordHash, 1000.00]
    );

    // Create test items
    await db.query(
        `INSERT INTO game_items (
            skinport_id, 
            name, 
            tradable_price, 
            non_tradable_price
        ) VALUES 
        ($1, $2, $3, $4),
        ($5, $6, $7, $8)`,
        [
            'item1', 'Test Item 1', 100.00, 90.00,
            'item2', 'Test Item 2', 500.00, null
        ]
    );
}

export async function cleanupTestDatabase() {
    await db.query('ROLLBACK');
}

export function createTestServer() {
    const app = new Elysia();
    
    app.use(rateLimit)
       .use(csrfProtection)
       .use(authMiddleware)
       .use(authController)
       .use(gameItemsController);
    
    return app;
}
