import { describe, expect, it, beforeEach, afterEach } from "bun:test";
import { setupTestDatabase, cleanupTestDatabase, createTestServer } from './helpers';
import { Elysia } from 'elysia';

describe('Authentication', () => {
    let app: Elysia;

    beforeEach(async () => {
        app = createTestServer();
        await setupTestDatabase();
    });

    afterEach(async () => {
        await cleanupTestDatabase();
    });

    describe('POST /api/auth/login', () => {
        it('should successfully login with valid credentials', async () => {
            const response = await app.handle(
                new Request('http://localhost/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: 'testuser',
                        password: 'testpass123'
                    })
                })
            );

            const data = await response.json();
            expect(response.status).toBe(200);
            expect(data.status).toBe('success');
            expect(data.data.username).toBe('testuser');
            expect(typeof data.data.sessionId).toBe('string');
            expect(typeof data.data.balance).toBe('number');
        });

        it('should fail with invalid credentials', async () => {
            const response = await app.handle(
                new Request('http://localhost/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: 'testuser',
                        password: 'wrongpass'
                    })
                })
            );

            const data = await response.json();
            expect(response.status).toBe(401);
            expect(data.status).toBe('error');
        });
    });

    describe('POST /api/auth/change-password', () => {
        it('should successfully change password when authenticated', async () => {
            // First login to get session
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
            const sessionId = loginData.data.sessionId;

            // Then change password
            const response = await app.handle(
                new Request('http://localhost/api/auth/change-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Cookie': `session=${sessionId}`
                    },
                    body: JSON.stringify({
                        currentPassword: 'testpass123',
                        newPassword: 'newpass123'
                    })
                })
            );

            const data = await response.json();
            expect(response.status).toBe(200);
            expect(data.status).toBe('success');

            // Verify can login with new password
            const newLoginResponse = await app.handle(
                new Request('http://localhost/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: 'testuser',
                        password: 'newpass123'
                    })
                })
            );

            const newLoginData = await newLoginResponse.json();
            expect(newLoginResponse.status).toBe(200);
            expect(newLoginData.status).toBe('success');
        });
    });
});
