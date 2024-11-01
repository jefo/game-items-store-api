import { describe, expect, it, beforeEach, afterEach } from "bun:test";
import { setupTestDatabase, cleanupTestDatabase, createTestServer } from './helpers';
import { Elysia } from 'elysia';

describe('Game Items', () => {
    let app: Elysia;
    let sessionId: string;

    beforeEach(async () => {
        app = createTestServer();
        await setupTestDatabase();
        
        // Login to get session
        const loginResponse = await app.handle(
            new Request('http://localhost/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: 'testuser',
                    password: 'testpass123'
                })
            })
        );

        const loginData = await loginResponse.json();
        sessionId = loginData.data.sessionId;
    });

    afterEach(async () => {
        await cleanupTestDatabase();
    });

    describe('GET /api/store', () => {
        it('should return list of available items', async () => {
            const response = await app.handle(
                new Request('http://localhost/api/store', {
                    headers: {
                        'Cookie': `session=${sessionId}`
                    }
                })
            );

            const data = await response.json();
            expect(response.status).toBe(200);
            expect(data.status).toBe('success');
            expect(Array.isArray(data.data)).toBe(true);
            expect(data.data.length).toBeGreaterThan(0);
        });

        it('should require authentication', async () => {
            const response = await app.handle(
                new Request('http://localhost/api/store')
            );

            expect(response.status).toBe(401);
        });
    });

    describe('POST /api/store/purchases', () => {
        it('should successfully purchase a tradable item', async () => {
            const response = await app.handle(
                new Request('http://localhost/api/store/purchases', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Cookie': `session=${sessionId}`
                    },
                    body: JSON.stringify({
                        itemId: 1,
                        isTradable: true
                    })
                })
            );

            const data = await response.json();
            expect(response.status).toBe(200);
            expect(data.status).toBe('success');
            expect(data.data.purchase.id).toBeDefined();
            expect(data.data.updatedBalance).toBeLessThan(1000);
        });

        it('should fail when trying to purchase item with insufficient balance', async () => {
            const response = await app.handle(
                new Request('http://localhost/api/store/purchases', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Cookie': `session=${sessionId}`
                    },
                    body: JSON.stringify({
                        itemId: 2,
                        isTradable: true
                    })
                })
            );

            const data = await response.json();
            expect(response.status).toBe(400);
            expect(data.status).toBe('error');
            expect(data.error).toBe('Insufficient balance');
        });
    });
});
