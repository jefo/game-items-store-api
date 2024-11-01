import { Elysia } from 'elysia';
import { createClient } from 'redis';
import { cfg } from '../cfg';

const WINDOW_SIZE_IN_SECONDS = 60;
const MAX_REQUESTS_PER_WINDOW = 100;

export const rateLimit = new Elysia().derive(async ({ request }) => {
    const client = createClient({ url: cfg.redis.url });
    await client.connect();

    try {
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const key = `ratelimit:${ip}`;

        const currentRequests = await client.incr(key);
        
        if (currentRequests === 1) {
            await client.expire(key, WINDOW_SIZE_IN_SECONDS);
        }

        if (currentRequests > MAX_REQUESTS_PER_WINDOW) {
            throw new Error('Too many requests');
        }

        return {};
    } finally {
        await client.quit();
    }
});
