import '@sinclair/typebox';
import { AuthUser } from '../lib/middleware/auth';

declare module 'elysia' {
    interface Context {
        user: AuthUser;
        set: {
            status?: number;
            headers?: Record<string, string>;
        };
        cookie: {
            [key: string]: {
                value: string;
                httpOnly?: boolean;
                secure?: boolean;
                sameSite?: string;
                maxAge?: number;
            };
        };
        store: Record<string, any>;
    }
}
