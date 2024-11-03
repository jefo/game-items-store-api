import { createClient } from 'redis';
import { cfg } from '../../lib/cfg';

export interface Session {
    userId: number;
    username: string;
}

export const SESSION_PREFIX = 'session:';
export const SESSION_TTL = 24 * 60 * 60; // 24 hours in seconds

export const getSessionKey = (sessionId: string): string => `${SESSION_PREFIX}${sessionId}`;

// Create Redis client
const redisClient = createClient({
    url: cfg.redis.url
});

redisClient.on('error', (error: Error) => console.error('Redis Client Error', error));
redisClient.connect();

export { redisClient };
