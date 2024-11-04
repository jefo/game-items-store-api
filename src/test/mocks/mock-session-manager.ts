import { ISessionManager, Session } from "../../lib/auth/redis-session";
import { key, provider, register, singleton } from "ts-ioc-container";
import { DataCacheToken } from "../../lib/caching";

@register(key(DataCacheToken))
@provider(singleton())
export class MockSessionManager implements ISessionManager {
    private sessions: Map<string, Session> = new Map();

    async createSession(userId: number, username: string): Promise<string> {
        const sessionId = crypto.randomUUID();
        this.sessions.set(sessionId, { userId, username });
        return sessionId;
    }

    async getSession(sessionId: string): Promise<Session | null> {
        return this.sessions.get(sessionId) || null;
    }

    async destroySession(sessionId: string): Promise<void> {
        this.sessions.delete(sessionId);
    }

    async refreshSession(sessionId: string): Promise<void> {
        // No-op for mock
    }
}
