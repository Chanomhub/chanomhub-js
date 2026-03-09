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

/** Supabase session (minimal type for SDK use) */
export interface SupabaseSession {
    access_token: string;
    refresh_token: string;
    expires_at?: number;
    user: {
        id: string;
        email?: string;
    };
}

/** Backend login request */
export interface LoginSupabaseRequest {
    accessToken: string;
}

/** Backend refresh token request */
export interface RefreshTokenRequest {
    refreshToken: string;
}

// ============================================
// React Native OAuth Types
// ============================================

/** Native OAuth provider configuration for React Native */
export interface NativeOAuthConfig {
    /** Google OAuth client ID (for Android/iOS) */
    googleClientId?: string;
    /** Google iOS client ID (optional, for iOS-specific config) */
    googleIosClientId?: string;
    /** Discord OAuth client ID */
    discordClientId?: string;
    /** GitHub OAuth client ID */
    githubClientId?: string;
    /** Custom redirect URI (e.g., com.yourapp://oauth) */
    redirectUri: string;
    /** Additional scopes to request */
    scopes?: string[];
}

/** Native OAuth authorization result from react-native-app-auth */
export interface NativeOAuthResult {
    /** Access token from OAuth provider */
    accessToken: string;
    /** ID token (for OpenID Connect providers like Google) */
    idToken?: string;
    /** Refresh token */
    refreshToken?: string;
    /** Token expiration date */
    accessTokenExpirationDate?: string;
    /** Token type (usually 'Bearer') */
    tokenType?: string;
    /** Scopes granted */
    scopes?: string[];
}

/** Options for native OAuth sign-in */
export interface NativeOAuthOptions {
    /** Additional scopes to request */
    scopes?: string[];
    /** Use PKCE (recommended, default: true) */
    usePKCE?: boolean;
}
