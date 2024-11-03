import { Elysia } from 'elysia';
import { AppError } from '../errors';

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

        // Handle unexpected errors
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
