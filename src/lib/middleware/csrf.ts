import { Elysia } from 'elysia';
import { createClient } from 'redis';
import { cfg } from '../cfg';

const CSRF_TOKEN_EXPIRY = 3600; // 1 hour in seconds

export const csrfProtection = new Elysia().derive(async ({ request, set }) => {
    // Skip CSRF check for login endpoint
    if (request.url.endsWith('/api/auth/login')) {
        return {};
    }

    const client = createClient({ url: cfg.redis.url });
    await client.connect();

    try {
        const token = request.headers.get('x-csrf-token');
        if (!token) {
            set.status = 403;
            throw new Error('CSRF token missing');
        }

        const isValid = await client.get(`csrf:${token}`);
        if (!isValid) {
            set.status = 403;
            throw new Error('Invalid CSRF token');
        }

        // Generate new token for next request
        const newToken = crypto.randomUUID();
        await client.set(`csrf:${newToken}`, '1', { EX: CSRF_TOKEN_EXPIRY });
        
        if (!set.headers) {
            set.headers = {};
        }
        set.headers['x-csrf-token'] = newToken;

        return {};
    } finally {
        await client.quit();
    }
});
