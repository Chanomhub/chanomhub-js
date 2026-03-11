/**
 * Chanomhub SDK - GraphQL and REST Clients
 *
 * Framework-agnostic API clients using standard fetch API.
 * Includes automatic token renewal logic.
 */

import type { ChanomhubConfig } from './config';
import type { GraphQLResponse } from './types/common';

// Shared state for token refreshing to handle concurrent requests
// Keyed by refreshToken to avoid cross-user token leakage in server-side environments
const refreshPromises = new Map<string, Promise<{ token: string; refreshToken: string } | null>>();

/**
 * Internal helper to refresh tokens
 */
async function performTokenRefresh(config: ChanomhubConfig): Promise<{ token: string; refreshToken: string } | null> {
    const refreshToken = config.refreshToken;
    if (!refreshToken) return null;

    try {
        // Use /api/auth/refresh as it's a REST call
        const res = await fetch(`${config.apiUrl}/api/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });

        if (!res.ok) throw new Error('Refresh failed');

        const json = await res.json();
        // Backend returns TokenPairDTO wrapped in 'data' by TransformInterceptor
        const data = json.data || json;
        const newToken = data.accessToken || data.token;
        const newRefreshToken = data.refreshToken;

        if (newToken && newRefreshToken) {
            // Update config in-place so subsequent requests use new token
            config.token = newToken;
            config.refreshToken = newRefreshToken;

            // Notify consumer (e.g., to update cookies)
            if (config.onTokenRefreshed) {
                config.onTokenRefreshed(newToken, newRefreshToken);
            }

            return { token: newToken, refreshToken: newRefreshToken };
        }
        return null;
    } catch (error) {
        console.error('SDK: Token refresh failed:', error);
        return null;
    } finally {
        // Clean up the promise from the map
        refreshPromises.delete(refreshToken);
    }
}

/**
 * Shared logic for handling 401 and refreshing tokens
 */
async function handleUnauthorized<T>(
    config: ChanomhubConfig,
    retryAction: (newToken: string) => Promise<T>,
): Promise<T | null> {
    const refreshToken = config.refreshToken;
    if (!refreshToken) return null;

    let promise = refreshPromises.get(refreshToken);

    if (!promise) {
        promise = performTokenRefresh(config);
        refreshPromises.set(refreshToken, promise);
    }

    const result = await promise;

    if (result && result.token) {
        return retryAction(result.token);
    }

    return null;
}

export interface FetchOptions {
    /** GraphQL operation name */
    operationName?: string;
    /** Cache duration in seconds (0 = no cache) */
    cacheSeconds?: number;
    /** Skip cache entirely */
    noCache?: boolean;
}

/**
 * Creates a GraphQL fetcher function
 *
 * @param config - SDK configuration
 * @returns GraphQL fetch function
 */
export function createGraphQLClient(config: ChanomhubConfig) {
    async function graphqlFetch<T>(
        query: string,
        variables: Record<string, unknown> = {},
        options: FetchOptions = {},
        isRetry = false,
    ): Promise<GraphQLResponse<T>> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        };

        if (config.token) {
            headers['Authorization'] = `Bearer ${config.token}`;
        }

        const fetchOptions: RequestInit = {
            method: 'POST',
            headers,
            body: JSON.stringify({
                query,
                variables,
                ...(options.operationName && { operationName: options.operationName }),
            }),
        };

        const useCache = !options.noCache && !config.token;
        const cacheSeconds = options.cacheSeconds ?? config.defaultCacheSeconds ?? 3600;

        if (useCache && cacheSeconds > 0) {
            (fetchOptions as RequestInit & { next?: { revalidate: number } }).next = {
                revalidate: cacheSeconds,
            };
        } else {
            fetchOptions.cache = 'no-store';
        }

        try {
            const res = await fetch(`${config.apiUrl}/api/v2/graphql`, fetchOptions);

            // Handle 401 Unauthorized - try to refresh token
            if (res.status === 401 && config.refreshToken && !isRetry) {
                const retryResult = await handleUnauthorized(config, (newToken) =>
                    graphqlFetch<T>(query, variables, options, true),
                );
                if (retryResult) return retryResult;
            }

            if (!res.ok) {
                const errorText = await res.text();
                console.error('GraphQL fetch error:', res.status, errorText);
                return {
                    data: null,
                    errors: [{ message: `HTTP ${res.status}: ${res.statusText}` }],
                };
            }

            const json = await res.json();

            if (json.errors) {
                // Check if any error is an authentication error
                const isAuthError = json.errors.some(
                    (e: any) =>
                        e.message?.includes('Unauthorized') ||
                        e.message?.includes('unauthorized') ||
                        e.extensions?.code === 'UNAUTHENTICATED' ||
                        e.extensions?.code === '401',
                );

                if (isAuthError && config.refreshToken && !isRetry) {
                    const retryResult = await handleUnauthorized(config, (newToken) =>
                        graphqlFetch<T>(query, variables, options, true),
                    );
                    if (retryResult) return retryResult;
                }

                console.error('GraphQL errors:', json.errors);
                return { data: null, errors: json.errors };
            }

            return { data: json.data as T };
        } catch (error) {
            console.error('GraphQL fetch exception:', error);
            return {
                data: null,
                errors: [{ message: error instanceof Error ? error.message : 'Unknown error' }],
            };
        }
    }

    return graphqlFetch;
}

export type GraphQLFetcher = ReturnType<typeof createGraphQLClient>;

/**
 * REST API response type
 */
export interface RestResponse<T> {
    data: T | null;
    error?: string;
}

/**
 * Creates a REST API client for non-GraphQL endpoints
 *
 * @param config - SDK configuration
 * @returns REST fetch function
 */
export function createRestClient(config: ChanomhubConfig) {
    async function restFetch<T>(
        endpoint: string,
        options: {
            method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
            body?: Record<string, unknown>;
        } = {},
        isRetry = false,
    ): Promise<RestResponse<T>> {
        const { method = 'GET', body } = options;

        const headers: Record<string, string> = {
            Accept: 'application/json',
        };

        if (config.token) {
            headers['Authorization'] = `Bearer ${config.token}`;
        }

        const fetchOptions: RequestInit = {
            method,
            headers,
            cache: 'no-store',
        };

        if (body) {
            headers['Content-Type'] = 'application/json';
            fetchOptions.body = JSON.stringify(body);
        }

        try {
            // DO NOT include /api prefix here anymore because it's already in repositories
            const res = await fetch(`${config.apiUrl}${endpoint}`, fetchOptions);

            // Handle 401 Unauthorized
            if (res.status === 401 && config.refreshToken && !isRetry && !endpoint.includes('/auth/refresh')) {
                const retryResult = await handleUnauthorized(config, (newToken) =>
                    restFetch<T>(endpoint, options, true),
                );
                if (retryResult) return retryResult;
            }

            if (!res.ok) {
                const errorText = await res.text();
                if (res.status !== 404) {
                    console.error('REST fetch error:', res.status, errorText);
                }
                return {
                    data: null,
                    error: `HTTP ${res.status}: ${res.statusText}`,
                };
            }

            if (res.status === 204) {
                return { data: null };
            }

            const json = await res.json();
            const responseData =
                json && typeof json === 'object' && 'data' in json && 'statusCode' in json
                    ? json.data
                    : json;

            return { data: responseData as T };
        } catch (error) {
            console.error('REST fetch exception:', error);
            return {
                data: null,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    return restFetch;
}

export type RestFetcher = ReturnType<typeof createRestClient>;
