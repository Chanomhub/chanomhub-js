/**
 * Chanomhub SDK - Auth Repository
 *
 * Handles OAuth authentication and token management via Better Auth.
 */

import type { ChanomhubConfig } from '../config';
import type { RestFetcher } from '../client';
import type {
    OAuthProvider,
    OAuthOptions,
    LoginResponse,
    RefreshResponse,
} from '../types/auth';

export interface AuthRepository {
    /** Check if OAuth is configured and available */
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
     * Exchanges Better Auth session for backend JWT.
     * Call this on your OAuth callback page (Web only).
     */
    handleCallback(): Promise<LoginResponse | null>;

    /** Sign out from Better Auth session */
    signOut(): Promise<void>;

    /** Refresh the backend access token using refresh token */
    refreshToken(refreshToken: string): Promise<RefreshResponse | null>;
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

    return {
        isOAuthEnabled,
        signInWithGoogle,
        signInWithProvider,
        getOAuthUrl,
        handleCallback,
        signOut,
        refreshToken,
    };
}
