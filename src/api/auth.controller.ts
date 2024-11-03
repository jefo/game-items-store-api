import { Elysia, t } from 'elysia';
import { container } from '../container';
import { rateLimit } from '../lib/middleware/rate-limit';
import { csrfProtection } from '../lib/middleware/csrf';
import { ICmd, IQuery } from '../lib/cqrs';
import {
    LoginCommandType,
    ChangePasswordCommandType,
    DestroySessionCommandType,
    GetSessionQueryType,
    LoginDto,
    LoginResult,
    ChangePasswordDto,
    Session
} from '../features/auth';
import { AuthenticationError } from '../lib/errors';

interface LoginContext {
    body: LoginDto;
    set: { status: number; headers?: Record<string, string> };
    cookie: {
        session: {
            value: string;
            httpOnly?: boolean;
            secure?: boolean;
            sameSite?: string;
            maxAge?: number;
        };
    };
    store: {
        loginCommand: ICmd<LoginDto, LoginResult>;
    };
}

interface ChangePasswordContext {
    body: ChangePasswordDto;
    set: { status: number; headers?: Record<string, string> };
    cookie: {
        session: {
            value: string;
        };
    };
    store: {
        changePasswordCommand: ICmd<ChangePasswordDto, void>;
        getSessionQuery: IQuery<{ sessionId: string }, Session | null>;
    };
}

interface LogoutContext {
    set: { status: number; headers?: Record<string, string> };
    cookie: {
        session: {
            value: string;
            maxAge?: number;
        };
    };
    store: {
        destroySessionCommand: ICmd<{ sessionId: string }, void>;
    };
}

export const authController = new Elysia({ prefix: '/api/auth' })
    .use(rateLimit)
    .use(csrfProtection)
    .state(
        'loginCommand',
        container.resolve<ICmd<LoginDto, LoginResult>>(LoginCommandType)
    )
    .state(
        'changePasswordCommand',
        container.resolve<ICmd<ChangePasswordDto, void>>(ChangePasswordCommandType)
    )
    .state(
        'destroySessionCommand',
        container.resolve<ICmd<{ sessionId: string }, void>>(DestroySessionCommandType)
    )
    .state(
        'getSessionQuery',
        container.resolve<IQuery<{ sessionId: string }, Session | null>>(GetSessionQueryType)
    )
    .post('/login', async ({ 
        body, 
        cookie: { session },
        store: { loginCommand } 
    }: LoginContext) => {
        try {
            const result = await loginCommand.execute(body);
            
            // Set session cookie
            session.value = result.sessionId;
            session.httpOnly = true;
            session.secure = process.env.NODE_ENV !== 'test'; // Only require secure in non-test environments
            session.sameSite = 'lax'; // Use lax to allow testing
            session.maxAge = 24 * 60 * 60; // 24 hours in seconds

            return {
                status: 'success',
                data: result
            };
        } catch (error) {
            throw new AuthenticationError(error instanceof Error ? error.message : 'Authentication failed');
        }
    }, {
        body: t.Object({
            username: t.String(),
            password: t.String()
        })
    })
    .post('/change-password', async ({ 
        body, 
        cookie: { session },
        store: { changePasswordCommand, getSessionQuery } 
    }: ChangePasswordContext) => {
        const currentSession = await getSessionQuery.execute({ sessionId: session.value });
        if (!currentSession) {
            throw new AuthenticationError();
        }

        try {
            await changePasswordCommand.execute({
                userId: currentSession.userId,
                currentPassword: body.currentPassword,
                newPassword: body.newPassword
            });

            return {
                status: 'success'
            };
        } catch (error) {
            throw new AuthenticationError(error instanceof Error ? error.message : 'Failed to change password');
        }
    }, {
        body: t.Object({
            currentPassword: t.String(),
            newPassword: t.String()
        })
    })
    .post('/logout', async ({
        cookie: { session },
        store: { destroySessionCommand }
    }: LogoutContext) => {
        try {
            await destroySessionCommand.execute({ sessionId: session.value });
            
            // Clear the session cookie
            session.value = '';
            session.maxAge = 0;
            
            return {
                status: 'success'
            };
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Failed to logout');
        }
    });
