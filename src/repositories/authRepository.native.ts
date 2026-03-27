/**
 * Chanomhub SDK - React Native Auth Repository
 *
 * This file contains React Native specific OAuth methods that require
 * react-native-app-auth. It is separated from the main auth repository
 * to avoid bundling React Native dependencies in web builds.
 *
 * @example
 * ```typescript
 * import { createNativeAuthRepository } from '@chanomhub/sdk/native';
 *
 * const nativeAuth = createNativeAuthRepository(rest, config);
 * const result = await nativeAuth.signInWithGoogleNative(nativeConfig);
 * ```
 */

import type { ChanomhubConfig } from '../config';
import type { RestFetcher } from '../client';
import type {
    OAuthProvider,
    LoginResponse,
    NativeOAuthConfig,
    NativeOAuthOptions,
    NativeOAuthResult,
} from '../types/auth';

// Import directly - this file is only bundled for React Native
import { authorize } from 'react-native-app-auth';

export interface NativeAuthRepository {
    /**
     * Sign in with Google OAuth for React Native apps.
     * @param nativeConfig - Native OAuth configuration with client IDs and redirect URI
     * @param options - Additional options like scopes
     * @returns Login response with user and tokens from backend
     */
    signInWithGoogleNative(
        nativeConfig: NativeOAuthConfig,
        options?: NativeOAuthOptions,
    ): Promise<LoginResponse | null>;

    /**
     * Sign in with any OAuth provider for React Native apps.
     * @param provider - OAuth provider (google, discord, github)
     * @param nativeConfig - Native OAuth configuration
     * @param options - Additional options
     * @returns Login response with user and tokens from backend
     */
    signInWithProviderNative(
        provider: OAuthProvider,
        nativeConfig: NativeOAuthConfig,
        options?: NativeOAuthOptions,
    ): Promise<LoginResponse | null>;

    /**
     * Exchange OAuth token from react-native-app-auth with backend.
     * Use this if you handle the OAuth flow yourself.
     * @param oauthResult - Result from react-native-app-auth authorize()
     * @returns Login response with user and backend tokens
     */
    exchangeOAuthToken(oauthResult: NativeOAuthResult): Promise<LoginResponse | null>;
}

/** OAuth provider configurations */
const OAUTH_CONFIGS: Record<
    OAuthProvider,
    {
        issuer: string;
        serviceConfiguration?: { authorizationEndpoint: string; tokenEndpoint: string };
        defaultScopes: string[];
    }
> = {
    google: {
        issuer: 'https://accounts.google.com',
        defaultScopes: ['openid', 'email', 'profile'],
    },
    discord: {
        serviceConfiguration: {
            authorizationEndpoint: 'https://discord.com/api/oauth2/authorize',
            tokenEndpoint: 'https://discord.com/api/oauth2/token',
        },
        issuer: '',
        defaultScopes: ['identify', 'email'],
    },
    github: {
        serviceConfiguration: {
            authorizationEndpoint: 'https://github.com/login/oauth/authorize',
            tokenEndpoint: 'https://github.com/login/oauth/access_token',
        },
        issuer: '',
        defaultScopes: ['read:user', 'user:email'],
    },
    facebook: {
        serviceConfiguration: {
            authorizationEndpoint: 'https://www.facebook.com/v18.0/dialog/oauth',
            tokenEndpoint: 'https://graph.facebook.com/v18.0/oauth/access_token',
        },
        issuer: '',
        defaultScopes: ['email', 'public_profile'],
    },
};

function getClientIdForProvider(provider: OAuthProvider, nativeConfig: NativeOAuthConfig): string {
    switch (provider) {
        case 'google':
            return nativeConfig.googleClientId || '';
        case 'discord':
            return nativeConfig.discordClientId || '';
        case 'github':
            return nativeConfig.githubClientId || '';
        default:
            return '';
    }
}

/**
 * Creates a React Native auth repository for native OAuth operations
 *
 * @param fetcher - REST API fetcher
 * @param _config - SDK configuration (reserved for future use)
 */
export function createNativeAuthRepository(
    fetcher: RestFetcher,
    _config: ChanomhubConfig,
): NativeAuthRepository {
    async function exchangeOAuthToken(
        oauthResult: NativeOAuthResult,
    ): Promise<LoginResponse | null> {
        // Use idToken for Google (OpenID Connect) or accessToken for others
        const tokenToExchange = oauthResult.idToken || oauthResult.accessToken;

        if (!tokenToExchange) {
            console.error('No token available to exchange with backend');
            return null;
        }

        // Exchange OAuth token for backend JWT
        const { data, error } = await fetcher<LoginResponse>('/api/users/login-oauth', {
            method: 'POST',
            body: {
                accessToken: tokenToExchange,
                provider: oauthResult.idToken ? 'google' : 'oauth',
            },
        });

        if (error) {
            console.error('Failed to exchange OAuth token with backend:', error);
            return null;
        }

        return data;
    }

    async function signInWithProviderNative(
        provider: OAuthProvider,
        nativeConfig: NativeOAuthConfig,
        options: NativeOAuthOptions = {},
    ): Promise<LoginResponse | null> {
        const clientId = getClientIdForProvider(provider, nativeConfig);

        if (!clientId) {
            throw new Error(
                `Missing client ID for ${provider}. Please provide ${provider}ClientId in nativeConfig.`,
            );
        }

        if (!nativeConfig.redirectUri) {
            throw new Error('Missing redirectUri in nativeConfig.');
        }

        const providerConfig = OAUTH_CONFIGS[provider];
        const scopes = options.scopes || providerConfig.defaultScopes;

        const authConfig: Record<string, unknown> = {
            clientId,
            redirectUrl: nativeConfig.redirectUri,
            scopes,
            usePKCE: options.usePKCE !== false, // Default to true
        };

        // Use issuer or serviceConfiguration
        if (providerConfig.issuer) {
            authConfig.issuer = providerConfig.issuer;
        } else if (providerConfig.serviceConfiguration) {
            authConfig.serviceConfiguration = providerConfig.serviceConfiguration;
        }

        // For Google iOS, use clientId specific config
        if (provider === 'google' && nativeConfig.googleIosClientId) {
            authConfig.clientId = nativeConfig.googleIosClientId;
        }

        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = await authorize(authConfig as any);
            return exchangeOAuthToken(result as NativeOAuthResult);
        } catch (error) {
            console.error(`Native OAuth error (${provider}):`, error);
            throw error;
        }
    }

    async function signInWithGoogleNative(
        nativeConfig: NativeOAuthConfig,
        options: NativeOAuthOptions = {},
    ): Promise<LoginResponse | null> {
        return signInWithProviderNative('google', nativeConfig, options);
    }

    return {
        signInWithGoogleNative,
        signInWithProviderNative,
        exchangeOAuthToken,
    };
}
