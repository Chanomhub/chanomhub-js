/**
 * Chanomhub API SDK
 *
 * A framework-agnostic TypeScript SDK for interacting with the Chanomhub API.
 * Works with Next.js, React Native, Node.js, and browser environments.
 *
 * @example
 * ```typescript
 * import { createChanomhubClient } from '@/lib/chanomhub-sdk';
 *
 * // Basic usage
 * const sdk = createChanomhubClient();
 * const articles = await sdk.articles.getByTag('renpy');
 *
 * // With authentication
 * const sdk = createChanomhubClient({ token: 'your-jwt-token' });
 * const article = await sdk.articles.getBySlug('my-article');
 *
 * // With custom config
 * const sdk = createChanomhubClient({
 *   apiUrl: 'https://api.chanomhub.com',
 *   cdnUrl: 'https://cdn.chanomhub.com',
 *   token: 'jwt-token',
 * });
 * ```
 *
 * For Next.js server components, use the helper from './next':
 * ```typescript
 * import { createServerClient } from '@/lib/chanomhub-sdk/next';
 * const sdk = await createServerClient(); // Reads token from cookies
 * ```
 */

import { createGraphQLClient, createRestClient, type GraphQLFetcher } from './client';
import {
    createArticleRepository,
    createFavoritesRepository,
    createUsersRepository,
    createSearchRepository,
    createAuthRepository,
    createDownloadsRepository,
    createModsRepository,
    createSponsoredArticlesRepository,
    createStorageRepository,
    createCheckoutRepository,
    createDeveloperRepository,
    type ArticleRepository,
    type FavoritesRepository,
    type UsersRepository,
    type SearchRepository,
    type AuthRepository,
    type DownloadsRepository,
    type ModsRepository,
    type SponsoredArticlesRepository,
    type StorageRepository,
    type CheckoutRepository,
    type DeveloperRepository,
} from './repositories';
import { DEFAULT_CONFIG, type ChanomhubConfig } from './config';

// Re-export types
export * from './types';
export * from './config';
export * from './errors';
export { resolveImageUrl, getFallbackUrl, buildImgproxyPath } from './transforms/imageUrl';
export { resolveDownloadUrl } from './transforms/downloadUrl';

/** Chanomhub SDK Client interface */
export interface ChanomhubClient {
    /** Article operations */
    articles: ArticleRepository;
    /** Favorites operations */
    favorites: FavoritesRepository;
    /** User/Profile operations */
    users: UsersRepository;
    /** Search operations */
    search: SearchRepository;
    /** Authentication operations (requires Supabase config for OAuth) */
    auth: AuthRepository;
    /** Downloads management operations */
    downloads: DownloadsRepository;
    /** Mods operations */
    mods: ModsRepository;
    /** Sponsored articles operations */
    sponsoredArticles: SponsoredArticlesRepository;
    /** Storage/Upload operations */
    storage: StorageRepository;
    /** Checkout and Purchase operations */
    checkout: CheckoutRepository;
    /** Developer operations */
    developer: DeveloperRepository;
    /** Raw GraphQL fetcher for custom queries */
    graphql: GraphQLFetcher;
    /** SDK configuration */
    config: ChanomhubConfig;
}

/**
 * Creates a Chanomhub API client
 *
 * This is the main entry point for the SDK. It creates a client that can be
 * used to interact with the Chanomhub API.
 *
 * @param config - Configuration options
 * @param config.apiUrl - API base URL (default: https://api.chanomhub.com)
 * @param config.cdnUrl - CDN base URL for images (default: https://cdn.chanomhub.com)
 * @param config.token - JWT authentication token (optional)
 * @param config.defaultCacheSeconds - Default cache duration in seconds (default: 3600)
 * @returns ChanomhubClient with articles repository and raw graphql fetcher
 *
 * @example
 * ```typescript
 * // Public access
 * const sdk = createChanomhubClient();
 *
 * // With authentication
 * const sdk = createChanomhubClient({ token: 'your-jwt-token' });
 * ```
 */
export function createChanomhubClient(config: Partial<ChanomhubConfig> = {}): ChanomhubClient {
    const fullConfig: ChanomhubConfig = {
        ...DEFAULT_CONFIG,
        ...config,
    };

    const graphql = createGraphQLClient(fullConfig);
    const rest = createRestClient(fullConfig);
    const articles = createArticleRepository(graphql, rest, fullConfig);
    const favorites = createFavoritesRepository(rest, fullConfig);
    const users = createUsersRepository(rest, fullConfig);
    const search = createSearchRepository(graphql, fullConfig);
    const auth = createAuthRepository(rest, fullConfig);
    const downloads = createDownloadsRepository(rest, graphql, fullConfig);
    const mods = createModsRepository(rest, fullConfig);
    const sponsoredArticles = createSponsoredArticlesRepository(graphql, rest, fullConfig);
    const storage = createStorageRepository(fullConfig);
    const checkout = createCheckoutRepository(graphql);
    const developer = createDeveloperRepository(rest);

    return {
        articles,
        favorites,
        users,
        search,
        auth,
        downloads,
        mods,
        sponsoredArticles,
        storage,
        checkout,
        developer,
        graphql,
        config: fullConfig,
    };
}

/**
 * Creates a client with authentication token
 * Convenience function for authenticated requests
 *
 * @param token - JWT authentication token
 * @param config - Optional configuration overrides
 * @returns ChanomhubClient
 */
export function createAuthenticatedClient(
    token: string,
    config: Partial<ChanomhubConfig> = {},
): ChanomhubClient {
    return createChanomhubClient({
        ...config,
        token,
        defaultCacheSeconds: 0, // Disable cache for authenticated requests
    });
}

// Default export
export default createChanomhubClient;
