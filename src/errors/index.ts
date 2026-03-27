/**
 * Chanomhub SDK - Error Classes
 *
 * Typed errors for better error handling in applications
 */

/** Base error class for all SDK errors */
export class ChanomhubError extends Error {
    readonly statusCode: number;
    readonly code: string;

    constructor(message: string, statusCode: number = 500, code: string = 'UNKNOWN_ERROR') {
        super(message);
        this.name = 'ChanomhubError';
        this.statusCode = statusCode;
        this.code = code;

        // Maintains proper stack trace for where error was thrown
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

/** Authentication error (401) - Missing or invalid token */
export class AuthenticationError extends ChanomhubError {
    constructor(message: string = 'Authentication required') {
        super(message, 401, 'AUTHENTICATION_ERROR');
        this.name = 'AuthenticationError';
    }
}

/** Authorization error (403) - Insufficient permissions */
export class AuthorizationError extends ChanomhubError {
    constructor(message: string = 'Permission denied') {
        super(message, 403, 'AUTHORIZATION_ERROR');
        this.name = 'AuthorizationError';
    }
}

/** Not found error (404) - Resource doesn't exist */
export class NotFoundError extends ChanomhubError {
    constructor(message: string = 'Resource not found') {
        super(message, 404, 'NOT_FOUND');
        this.name = 'NotFoundError';
    }
}

/** Validation error (400) - Invalid request data */
export class ValidationError extends ChanomhubError {
    readonly errors?: Record<string, string[]>;

    constructor(message: string = 'Validation failed', errors?: Record<string, string[]>) {
        super(message, 400, 'VALIDATION_ERROR');
        this.name = 'ValidationError';
        this.errors = errors;
    }
}

/** Network error - Fetch failures, timeouts, etc. */
export class NetworkError extends ChanomhubError {
    constructor(message: string = 'Network request failed') {
        super(message, 0, 'NETWORK_ERROR');
        this.name = 'NetworkError';
    }
}

/** Rate limit error (429) - Too many requests */
export class RateLimitError extends ChanomhubError {
    readonly retryAfter?: number;

    constructor(message: string = 'Rate limit exceeded', retryAfter?: number) {
        super(message, 429, 'RATE_LIMIT');
        this.name = 'RateLimitError';
        this.retryAfter = retryAfter;
    }
}

/**
 * Creates the appropriate error class based on HTTP status code
 */
export function createErrorFromStatus(status: number, message: string): ChanomhubError {
    switch (status) {
        case 400:
            return new ValidationError(message);
        case 401:
            return new AuthenticationError(message);
        case 403:
            return new AuthorizationError(message);
        case 404:
            return new NotFoundError(message);
        case 429:
            return new RateLimitError(message);
        default:
            return new ChanomhubError(message, status);
    }
}
