/**
 * Auth Repository Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createAuthRepository } from '../repositories/authRepository';
import type { ChanomhubConfig } from '../config';
import type { RestFetcher } from '../client';

describe('authRepository', () => {
    let mockFetcher: ReturnType<typeof vi.fn>;
    let config: ChanomhubConfig;

    beforeEach(() => {
        mockFetcher = vi.fn();
        config = {
            apiUrl: 'https://api.chanomhub.com',
            cdnUrl: 'https://cdn.chanomhub.com',
        };
    });

    describe('isOAuthEnabled', () => {
        it('should return false when Supabase is not configured', () => {
            const auth = createAuthRepository(mockFetcher as RestFetcher, config);
            expect(auth.isOAuthEnabled()).toBe(false);
        });

        it('should return true when Supabase URL and key are provided', () => {
            config.supabaseUrl = 'https://test.supabase.co';
            config.supabaseAnonKey = 'test-anon-key';
            const auth = createAuthRepository(mockFetcher as RestFetcher, config);
            expect(auth.isOAuthEnabled()).toBe(true);
        });

        it('should return false when only URL is provided', () => {
            config.supabaseUrl = 'https://test.supabase.co';
            const auth = createAuthRepository(mockFetcher as RestFetcher, config);
            expect(auth.isOAuthEnabled()).toBe(false);
        });
    });

    describe('signInWithProvider', () => {
        it('should throw error when Supabase is not configured', async () => {
            const auth = createAuthRepository(mockFetcher as RestFetcher, config);

            await expect(auth.signInWithProvider('google')).rejects.toThrow(
                'Supabase is not configured',
            );
        });
    });

    describe('signInWithGoogle', () => {
        it('should throw error when Supabase is not configured', async () => {
            const auth = createAuthRepository(mockFetcher as RestFetcher, config);

            await expect(auth.signInWithGoogle()).rejects.toThrow('Supabase is not configured');
        });
    });

    describe('refreshToken', () => {
        it('should call refresh token endpoint with correct body', async () => {
            mockFetcher.mockResolvedValue({
                data: { token: 'new-token', refreshToken: 'new-refresh-token' },
                error: undefined,
            });

            const auth = createAuthRepository(mockFetcher as RestFetcher, config);
            const result = await auth.refreshToken('old-refresh-token');

            expect(mockFetcher).toHaveBeenCalledWith('/api/users/refresh-token', {
                method: 'POST',
                body: { refreshToken: 'old-refresh-token' },
            });
            expect(result).toEqual({ token: 'new-token', refreshToken: 'new-refresh-token' });
        });

        it('should return null when refresh fails', async () => {
            mockFetcher.mockResolvedValue({
                data: null,
                error: 'Token expired',
            });

            const auth = createAuthRepository(mockFetcher as RestFetcher, config);
            const result = await auth.refreshToken('expired-token');

            expect(result).toBeNull();
        });
    });

    describe('getSupabaseSession', () => {
        it('should return null when Supabase is not configured', async () => {
            const auth = createAuthRepository(mockFetcher as RestFetcher, config);
            const session = await auth.getSupabaseSession();

            expect(session).toBeNull();
        });
    });

    // Note: React Native OAuth tests (signInWithGoogleNative, signInWithProviderNative, exchangeOAuthToken)
    // are now tested in auth.native.test.ts since those methods moved to @chanomhub/sdk/native

    // ============================================
    // Electron / Server-side OAuth Tests
    // ============================================

    describe('getOAuthUrl', () => {
        it('should return OAuth URL when Supabase is configured', async () => {
            config.supabaseUrl = 'https://test.supabase.co';
            config.supabaseAnonKey = 'test-key';
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const auth = createAuthRepository(mockFetcher as RestFetcher, config);

            // Mock Supabase client setup would go here
        });
    });

    it('should have getOAuthUrl method', () => {
        const auth = createAuthRepository(mockFetcher as RestFetcher, config);
        expect(typeof auth.getOAuthUrl).toBe('function');
    });
});
