import { Elysia } from 'elysia';
import { container } from '../../container';
import { GetSessionQueryType } from '../../features/auth';
import { IQuery } from '../cqrs';
import { Session } from '../auth/redis-session';

export interface AuthUser {
    id: number;
    username: string;
}

declare global {
    namespace Elysia {
        interface Context {
            user: AuthUser;
        }
    }
}

export const authMiddleware = new Elysia()
    .state(
        'getSessionQuery',
        container.resolve<IQuery<{ sessionId: string }, Session | null>>(GetSessionQueryType)
    )
    .derive(async ({ request, cookie: { session }, set, store: { getSessionQuery } }) => {
        // Skip auth check for login endpoint
        if (request.url.endsWith('/api/auth/login')) {
            return {};
        }

        if (!session?.value) {
            set.status = 401;
            throw new Error('Unauthorized');
        }

        const currentSession = await getSessionQuery.execute({ sessionId: session.value });
        if (!currentSession) {
            set.status = 401;
            throw new Error('Unauthorized');
        }

        return {
            user: {
                id: currentSession.userId,
                username: currentSession.username
            }
        };
    });
