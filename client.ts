/**
 * Chanomhub SDK - GraphQL Client
 *
 * Framework-agnostic GraphQL client using standard fetch API.
 * Works with any JavaScript runtime that supports fetch.
 */

import type { ChanomhubConfig } from './config';
import type { GraphQLResponse } from './types/common';
import { transformImageUrlsDeep } from './transforms/imageUrl';

export interface FetchOptions {
    /** GraphQL operation name */
    operationName?: string;
    /** Cache duration in seconds (0 = no cache) */
    cacheSeconds?: number;
    /** Skip cache entirely */
    noCache?: boolean;
}

/**
 * Creates a GraphQL fetcher function with automatic image URL transformation
 *
 * @param config - SDK configuration
 * @returns GraphQL fetch function
 */
export function createGraphQLClient(config: ChanomhubConfig) {
    return async function graphqlFetch<T>(
        query: string,
        variables: Record<string, unknown> = {},
        options: FetchOptions = {},
    ): Promise<GraphQLResponse<T>> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        };

        if (config.token) {
            headers['Authorization'] = `Bearer ${config.token}`;
        }

        // Build fetch options - framework agnostic
        const fetchOptions: RequestInit = {
            method: 'POST',
            headers,
            body: JSON.stringify({
                query,
                variables,
                ...(options.operationName && { operationName: options.operationName }),
            }),
        };

        // Handle caching - use Next.js revalidate option for ISR support
        const useCache = !options.noCache && !config.token;
        const cacheSeconds = options.cacheSeconds ?? config.defaultCacheSeconds ?? 3600;

        if (useCache && cacheSeconds > 0) {
            // Use Next.js ISR caching with revalidate option
            (fetchOptions as RequestInit & { next?: { revalidate: number } }).next = {
                revalidate: cacheSeconds,
            };
        } else {
            // Disable caching entirely
            fetchOptions.cache = 'no-store';
        }

        try {
            const res = await fetch(`${config.apiUrl}/api/graphql`, fetchOptions);

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
                console.error('GraphQL errors:', json.errors);
                return { data: null, errors: json.errors };
            }

            // Auto-transform all image URLs in the response
            const transformedData = transformImageUrlsDeep(json.data, config.cdnUrl) as T;

            return { data: transformedData };
        } catch (error) {
            console.error('GraphQL fetch exception:', error);
            return {
                data: null,
                errors: [{ message: error instanceof Error ? error.message : 'Unknown error' }],
            };
        }
    };
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
    return async function restFetch<T>(
        endpoint: string,
        options: {
            method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
            body?: Record<string, unknown>;
        } = {},
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
            cache: 'no-store', // REST calls are typically mutations, no caching
        };

        if (body) {
            headers['Content-Type'] = 'application/json';
            fetchOptions.body = JSON.stringify(body);
        }

        try {
            const res = await fetch(`${config.apiUrl}${endpoint}`, fetchOptions);

            if (!res.ok) {
                const errorText = await res.text();
                console.error('REST fetch error:', res.status, errorText);
                return {
                    data: null,
                    error: `HTTP ${res.status}: ${res.statusText}`,
                };
            }

            // Some endpoints may return empty body (204)
            if (res.status === 204) {
                return { data: null };
            }

            const json = await res.json();

            // Handle API responses that wrap data in a 'data' field
            // e.g., { data: { profile: {...} }, statusCode: 200, timestamp: "..." }
            const responseData =
                json && typeof json === 'object' && 'data' in json && 'statusCode' in json
                    ? json.data
                    : json;

            // Transform image URLs if present
            const transformedData = transformImageUrlsDeep(responseData, config.cdnUrl) as T;

            return { data: transformedData };
        } catch (error) {
            console.error('REST fetch exception:', error);
            return {
                data: null,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    };
}

export type RestFetcher = ReturnType<typeof createRestClient>;
