import { Elysia } from 'elysia';
import { Container } from 'ts-ioc-container';
import { GetSessionQueryType, RefreshSessionCommandType, Session } from '../../features/auth';
import { ICmd, IQuery } from '../cqrs';
import { AuthenticationError } from '../errors';
import { container } from '../../container';

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

const createAuthMiddleware = (container: Container) => new Elysia()
    .state(
        'getSessionQuery',
        container.resolve<IQuery<{ sessionId: string }, Session | null>>(GetSessionQueryType)
    )
    .state(
        'refreshSessionCommand',
        container.resolve<ICmd<{ sessionId: string }, void>>(RefreshSessionCommandType)
    )
    .derive(async ({ request, cookie: { session }, store: { getSessionQuery, refreshSessionCommand } }) => {
        // Skip auth check for login endpoint
        if (request.url.endsWith('/api/auth/login')) {
            return {};
        }

        if (!session?.value) {
            throw new AuthenticationError('No session provided');
        }

        const currentSession = await getSessionQuery.execute({ sessionId: session.value });
        if (!currentSession) {
            throw new AuthenticationError('Invalid session');
        }

        // Refresh session TTL after successful validation
        await refreshSessionCommand.execute({ sessionId: session.value });

        return {
            user: {
                id: currentSession.userId,
                username: currentSession.username
            }
        };
    });

// Export the middleware instance
export const authMiddleware = createAuthMiddleware(container);
