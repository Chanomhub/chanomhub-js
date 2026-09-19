/**
 * Chanomhub SDK - Auth Types
 */

import type { User } from './user';

/** Supported OAuth providers */
export type OAuthProvider = 'google' | 'discord' | 'github' | 'facebook';

/** OAuth redirect options */
export interface OAuthOptions {
    /** URL to redirect to after OAuth */
    redirectTo?: string;
    /** Additional scopes to request */
    scopes?: string;
    /** Skip automatic browser redirect (useful for Electron/Server-side) */
    skipBrowserRedirect?: boolean;
    /** Additional query parameters for the OAuth URL */
    queryParams?: { [key: string]: string };
}

/** Login response from backend after token exchange */
export interface LoginResponse {
    user: User;
    token?: string;
    accessToken?: string;
    refreshToken: string;
}

/** Token refresh response from backend */
export interface RefreshResponse {
    token?: string;
    accessToken?: string;
    refreshToken?: string;
}

/** Auth session state */
export interface AuthSession {
    user: User;
    token: string;
    refreshToken: string;
    expiresAt?: number;
}

/** Backend refresh token request */
export interface RefreshTokenRequest {
    refreshToken: string;
}
