/**
 * Chanomhub SDK - Favorites Repository
 */

import type { RestFetcher } from '../client';
import type { ChanomhubConfig } from '../config';
import type { Article } from '../types/article';
import { AuthenticationError } from '../errors';

/** Favorite response from API */
export interface FavoriteResponse {
    article: Article;
}

export interface FavoritesRepository {
    /** Add article to favorites (requires authentication) */
    add(slug: string): Promise<FavoriteResponse | null>;

    /** Remove article from favorites (requires authentication) */
    remove(slug: string): Promise<FavoriteResponse | null>;
}

/**
 * Creates a favorites repository with the given REST client
 * @throws {AuthenticationError} if token is not provided in config
 */
export function createFavoritesRepository(
    fetcher: RestFetcher,
    config: ChanomhubConfig,
): FavoritesRepository {
    function requireAuth(): void {
        if (!config.token) {
            throw new AuthenticationError(
                'Authentication required for favorites. Use createAuthenticatedClient() or provide a token.',
            );
        }
    }

    async function add(slug: string): Promise<FavoriteResponse | null> {
        requireAuth();

        const { data, error } = await fetcher<FavoriteResponse>(
            `/api/articles/${encodeURIComponent(slug)}/favorite`,
            { method: 'POST', body: {} },
        );

        if (error) {
            console.error('Failed to add favorite:', error);
            return null;
        }

        return data;
    }

    async function remove(slug: string): Promise<FavoriteResponse | null> {
        requireAuth();

        const { data, error } = await fetcher<FavoriteResponse>(
            `/api/articles/${encodeURIComponent(slug)}/favorite`,
            { method: 'DELETE', body: {} },
        );

        if (error) {
            console.error('Failed to remove favorite:', error);
            return null;
        }

        return data;
    }

    return {
        add,
        remove,
    };
}
