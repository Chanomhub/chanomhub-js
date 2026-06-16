/**
 * Chanomhub SDK - Auth Repository
 *
 * Handles OAuth authentication via Supabase and token exchange with backend.
 *
 * For React Native apps, use the native auth repository from '@chanomhub/sdk/native'
 * which includes methods like signInWithGoogleNative and signInWithProviderNative.
 */

import type { ChanomhubConfig } from '../config';
import type { RestFetcher } from '../client';
import type {
    OAuthProvider,
    OAuthOptions,
    LoginResponse,
    RefreshResponse,
    SupabaseSession,
} from '../types/auth';

// Type for Supabase client (optional dependency)
type SupabaseClient = {
    auth: {
        signInWithOAuth: (options: {
            provider: OAuthProvider;
            options?: {
                redirectTo?: string;
                scopes?: string;
                queryParams?: { [key: string]: string };
                skipBrowserRedirect?: boolean;
            };
        }) => Promise<{ data: { url: string | null }; error: Error | null }>;
        signOut: () => Promise<{ error: Error | null }>;
        getSession: () => Promise<{
            data: { session: SupabaseSession | null };
            error: Error | null;
        }>;
    };
};

export interface AuthRepository {
    /** Check if Supabase OAuth is configured and available */
    isOAuthEnabled(): boolean;

    /** Sign in with Google OAuth - redirects to Google login page (Web only) */
    signInWithGoogle(options?: OAuthOptions): Promise<{ url: string | null }>;

    /** Sign in with any supported OAuth provider */
    signInWithProvider(
        provider: OAuthProvider,
        options?: OAuthOptions,
    ): Promise<{ url: string | null }>;

    /**
     * Get the OAuth URL for manual redirect handling (Electron, etc.)
     * @param provider - OAuth provider
     * @param options - OAuth options
     * @returns OAuth URL string
     */
    getOAuthUrl(provider: OAuthProvider, options?: OAuthOptions): Promise<string | null>;

    /**
     * Handle OAuth callback after redirect back from provider.
     * Exchanges Supabase access token for backend JWT.
     * Call this on your OAuth callback page (Web only).
     */
    handleCallback(): Promise<LoginResponse | null>;

    /** Sign out from Supabase (clears Supabase session only) */
    signOut(): Promise<void>;

    /** Refresh the backend access token using refresh token */
    refreshToken(refreshToken: string): Promise<RefreshResponse | null>;

    /** Get current Supabase session (if any) */
    getSupabaseSession(): Promise<SupabaseSession | null>;
}

/**
 * Creates an auth repository for OAuth operations using Better Auth
 *
 * @param fetcher - REST API fetcher
 * @param config - SDK configuration
 */
export function createAuthRepository(
    fetcher: RestFetcher,
    config: ChanomhubConfig,
): AuthRepository {
    function isOAuthEnabled(): boolean {
        // Better Auth OAuth is always considered enabled on the client as it falls back to backend configs
        return true;
    }

    async function getOAuthUrl(
        provider: OAuthProvider,
        options: OAuthOptions = {},
    ): Promise<string | null> {
        const apiBaseUrl = config.apiUrl || 'https://api.chanomhub.com';
        const redirectUrl = options.redirectTo || '';
        return `${apiBaseUrl}/api/auth/sign-in/social?provider=${provider}&callbackURL=${encodeURIComponent(redirectUrl)}`;
    }

    async function signInWithProvider(
        provider: OAuthProvider,
        options: OAuthOptions = {},
    ): Promise<{ url: string | null }> {
        const url = await getOAuthUrl(provider, options);

        if (options.skipBrowserRedirect && url) {
            return { url };
        }

        if (typeof window !== 'undefined' && url) {
            window.location.href = url;
        }

        return { url: null };
    }

    async function signInWithGoogle(options: OAuthOptions = {}): Promise<{ url: string | null }> {
        return signInWithProvider('google', options);
    }

    async function handleCallback(): Promise<LoginResponse | null> {
        // Exchange Better Auth session for backend JWT
        const { data: loginData, error: loginError } = await fetcher<LoginResponse>(
            '/api/auth/exchange',
            {
                method: 'POST',
            },
        );

        if (loginError) {
            console.error('Failed to exchange Better Auth session with backend:', loginError);
            return null;
        }

        return loginData;
    }

    async function signOut(): Promise<void> {
        const apiBaseUrl = config.apiUrl || 'https://api.chanomhub.com';
        try {
            await fetch(`${apiBaseUrl}/api/auth/sign-out`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch (error) {
            console.error('Better Auth sign-out error:', error);
        }
    }

    async function refreshToken(refreshToken: string): Promise<RefreshResponse | null> {
        const { data, error } = await fetcher<RefreshResponse>('/api/auth/refresh', {
            method: 'POST',
            body: { refreshToken },
        });

        if (error) {
            console.error('Failed to refresh token:', error);
            return null;
        }

        return data;
    }

    async function getSupabaseSession(): Promise<SupabaseSession | null> {
        return null;
    }

    return {
        isOAuthEnabled,
        signInWithGoogle,
        signInWithProvider,
        getOAuthUrl,
        handleCallback,
        signOut,
        refreshToken,
        getSupabaseSession,
    };
}
