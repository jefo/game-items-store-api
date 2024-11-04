import { Elysia } from 'elysia';
import { AppError, AuthenticationError, ValidationError } from '../errors';

interface ErrorResponse {
    status: 'error';
    error: {
        code: string;
        message: string;
    };
}

export const errorHandler = new Elysia()
    .onError(({ code, error, set }): ErrorResponse => {
        console.error(`Error [${code}]:`, error);

        // Handle Elysia's built-in validation errors
        if (code === 'VALIDATION') {
            set.status = 400;
            return {
                status: 'error',
                error: {
                    code: 'VALIDATION_ERROR',
                    message: error.message
                }
            };
        }

        // Handle authentication errors
        if (error instanceof AuthenticationError) {
            set.status = 401;
            return {
                status: 'error',
                error: {
                    code: 'AUTHENTICATION_ERROR',
                    message: error.message
                }
            };
        }

        // Handle validation errors
        if (error instanceof ValidationError) {
            set.status = 400;
            return {
                status: 'error',
                error: {
                    code: 'VALIDATION_ERROR',
                    message: error.message
                }
            };
        }

        // Handle our custom AppErrors
        if (error instanceof AppError) {
            set.status = error.statusCode;
            return {
                status: 'error',
                error: {
                    code: error.code,
                    message: error.message
                }
            };
        }

        // Handle NOT_FOUND errors from Elysia
        if (code === 'NOT_FOUND') {
            set.status = 404;
            return {
                status: 'error',
                error: {
                    code: 'NOT_FOUND',
                    message: error.message
                }
            };
        }

        // Handle unexpected errors
        console.error('Unexpected error:', error);
        set.status = 500;
        return {
            status: 'error',
            error: {
                code: 'INTERNAL_ERROR',
                message: process.env.NODE_ENV === 'production' 
                    ? 'Internal server error'
                    : error.message || 'Internal server error'
            }
        };
    });
