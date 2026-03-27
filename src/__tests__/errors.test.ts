import { describe, it, expect } from 'vitest';
import {
    ChanomhubError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ValidationError,
    NetworkError,
    RateLimitError,
    createErrorFromStatus,
} from '../errors';

describe('Error Classes', () => {
    describe('ChanomhubError', () => {
        it('should create error with message and defaults', () => {
            const error = new ChanomhubError('Test error');

            expect(error.message).toBe('Test error');
            expect(error.statusCode).toBe(500);
            expect(error.code).toBe('UNKNOWN_ERROR');
            expect(error.name).toBe('ChanomhubError');
        });

        it('should create error with custom status and code', () => {
            const error = new ChanomhubError('Custom', 418, 'TEAPOT');

            expect(error.statusCode).toBe(418);
            expect(error.code).toBe('TEAPOT');
        });
    });

    describe('AuthenticationError', () => {
        it('should create with default message', () => {
            const error = new AuthenticationError();

            expect(error.message).toBe('Authentication required');
            expect(error.statusCode).toBe(401);
            expect(error.code).toBe('AUTHENTICATION_ERROR');
            expect(error.name).toBe('AuthenticationError');
        });

        it('should create with custom message', () => {
            const error = new AuthenticationError('Token expired');
            expect(error.message).toBe('Token expired');
        });
    });

    describe('AuthorizationError', () => {
        it('should create with correct properties', () => {
            const error = new AuthorizationError();

            expect(error.message).toBe('Permission denied');
            expect(error.statusCode).toBe(403);
            expect(error.code).toBe('AUTHORIZATION_ERROR');
        });
    });

    describe('NotFoundError', () => {
        it('should create with correct properties', () => {
            const error = new NotFoundError();

            expect(error.message).toBe('Resource not found');
            expect(error.statusCode).toBe(404);
            expect(error.code).toBe('NOT_FOUND');
        });
    });

    describe('ValidationError', () => {
        it('should create with errors object', () => {
            const validationErrors = { email: ['Invalid email'], password: ['Too short'] };
            const error = new ValidationError('Validation failed', validationErrors);

            expect(error.statusCode).toBe(400);
            expect(error.code).toBe('VALIDATION_ERROR');
            expect(error.errors).toEqual(validationErrors);
        });
    });

    describe('NetworkError', () => {
        it('should create with correct properties', () => {
            const error = new NetworkError('Connection timeout');

            expect(error.message).toBe('Connection timeout');
            expect(error.statusCode).toBe(0);
            expect(error.code).toBe('NETWORK_ERROR');
        });
    });

    describe('RateLimitError', () => {
        it('should create with retryAfter', () => {
            const error = new RateLimitError('Too many requests', 60);

            expect(error.statusCode).toBe(429);
            expect(error.code).toBe('RATE_LIMIT');
            expect(error.retryAfter).toBe(60);
        });
    });

    describe('createErrorFromStatus', () => {
        it('should create AuthenticationError for 401', () => {
            const error = createErrorFromStatus(401, 'Unauthorized');
            expect(error).toBeInstanceOf(AuthenticationError);
        });

        it('should create AuthorizationError for 403', () => {
            const error = createErrorFromStatus(403, 'Forbidden');
            expect(error).toBeInstanceOf(AuthorizationError);
        });

        it('should create NotFoundError for 404', () => {
            const error = createErrorFromStatus(404, 'Not found');
            expect(error).toBeInstanceOf(NotFoundError);
        });

        it('should create ValidationError for 400', () => {
            const error = createErrorFromStatus(400, 'Bad request');
            expect(error).toBeInstanceOf(ValidationError);
        });

        it('should create RateLimitError for 429', () => {
            const error = createErrorFromStatus(429, 'Rate limited');
            expect(error).toBeInstanceOf(RateLimitError);
        });

        it('should create ChanomhubError for unknown status', () => {
            const error = createErrorFromStatus(500, 'Server error');
            expect(error).toBeInstanceOf(ChanomhubError);
            expect(error.statusCode).toBe(500);
        });
    });

    describe('Error inheritance', () => {
        it('all errors should be instanceof ChanomhubError', () => {
            expect(new AuthenticationError()).toBeInstanceOf(ChanomhubError);
            expect(new AuthorizationError()).toBeInstanceOf(ChanomhubError);
            expect(new NotFoundError()).toBeInstanceOf(ChanomhubError);
            expect(new ValidationError()).toBeInstanceOf(ChanomhubError);
            expect(new NetworkError()).toBeInstanceOf(ChanomhubError);
            expect(new RateLimitError()).toBeInstanceOf(ChanomhubError);
        });

        it('all errors should be instanceof Error', () => {
            expect(new ChanomhubError('test')).toBeInstanceOf(Error);
            expect(new AuthenticationError()).toBeInstanceOf(Error);
        });
    });
});
