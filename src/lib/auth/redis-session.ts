import { createClient } from 'redis';
import { cfg } from '../cfg';

export interface Session {
    userId: number;
    username: string;
}

export const RedisSessionManagerType = Symbol('RedisSessionManager');

export class RedisSessionManager {
    private client;
    private readonly sessionPrefix = 'session:';
    private readonly sessionTTL = 24 * 60 * 60; // 24 hours in seconds

    constructor(client?: any) {
        if (client) {
            this.client = client;
        } else {
            this.client = createClient({
                url: cfg.redis.url
            });
            
            this.client.on('error', (error: Error) => console.error('Redis Client Error', error));
            this.client.connect();
        }
    }

    async createSession(userId: number, username: string): Promise<string> {
        const sessionId = crypto.randomUUID();
        const session: Session = { userId, username };
        
        await this.client.set(
            this.getKey(sessionId),
            JSON.stringify(session),
            { EX: this.sessionTTL }
        );
        
        return sessionId;
    }

    async getSession(sessionId: string): Promise<Session | null> {
        const data = await this.client.get(this.getKey(sessionId));
        if (!data) return null;
        
        return JSON.parse(data) as Session;
    }

    async destroySession(sessionId: string): Promise<void> {
        await this.client.del(this.getKey(sessionId));
    }

    async refreshSession(sessionId: string): Promise<void> {
        const session = await this.getSession(sessionId);
        if (session) {
            await this.client.expire(this.getKey(sessionId), this.sessionTTL);
        }
    }

    private getKey(sessionId: string): string {
        return `${this.sessionPrefix}${sessionId}`;
    }
}

// Create default instance
const defaultClient = createClient({
    url: cfg.redis.url
});
defaultClient.on('error', (error: Error) => console.error('Redis Client Error', error));
defaultClient.connect();

export const sessionManager = new RedisSessionManager(defaultClient);