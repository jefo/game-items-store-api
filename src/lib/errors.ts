export class AppError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number = 500,
        public readonly code: string = 'INTERNAL_ERROR'
    ) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, 400, 'VALIDATION_ERROR');
    }
}

export class AuthenticationError extends AppError {
    constructor(message: string = 'Authentication failed') {
        super(message, 401, 'AUTHENTICATION_ERROR');
    }
}

export class AuthorizationError extends AppError {
    constructor(message: string = 'Access denied') {
        super(message, 403, 'AUTHORIZATION_ERROR');
    }
}

export class NotFoundError extends AppError {
    constructor(message: string) {
        super(message, 404, 'NOT_FOUND');
    }
}

export class ConflictError extends AppError {
    constructor(message: string) {
        super(message, 409, 'CONFLICT');
    }
}

export class RateLimitError extends AppError {
    constructor(message: string = 'Too many requests') {
        super(message, 429, 'RATE_LIMIT');
    }
}
