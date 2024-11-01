import { Elysia, t } from 'elysia';
import { container } from '../container';
import { rateLimit } from '../lib/middleware/rate-limit';
import { csrfProtection } from '../lib/middleware/csrf';
import { ICmd, IQuery } from '../lib/cqrs';
import {
    LoginCommandType,
    ChangePasswordCommandType,
    GetSessionQueryType,
    LoginDto,
    LoginResult,
    ChangePasswordDto,
} from '../features/auth';
import { Session } from '../lib/auth/redis-session';

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
        'getSessionQuery',
        container.resolve<IQuery<{ sessionId: string }, Session | null>>(GetSessionQueryType)
    )
    .post('/login', async ({ 
        body, 
        set, 
        cookie: { session },
        store: { loginCommand } 
    }: LoginContext) => {
        try {
            const result = await loginCommand.execute(body);
            
            session.value = result.sessionId;
            session.httpOnly = true;
            session.secure = true;
            session.sameSite = 'strict';
            session.maxAge = 24 * 60 * 60; // 24 hours in seconds

            return {
                status: 'success',
                data: result
            };
        } catch (error) {
            set.status = 401;
            return {
                status: 'error',
                error: error instanceof Error ? error.message : 'Authentication failed'
            };
        }
    }, {
        body: t.Object({
            username: t.String(),
            password: t.String()
        })
    })
    .post('/change-password', async ({ 
        body, 
        set, 
        cookie: { session },
        store: { changePasswordCommand, getSessionQuery } 
    }: ChangePasswordContext) => {
        const currentSession = await getSessionQuery.execute({ sessionId: session.value });
        if (!currentSession) {
            set.status = 401;
            return {
                status: 'error',
                error: 'Unauthorized'
            };
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
            set.status = 400;
            return {
                status: 'error',
                error: error instanceof Error ? error.message : 'Failed to change password'
            };
        }
    }, {
        body: t.Object({
            currentPassword: t.String(),
            newPassword: t.String()
        })
    });
