/**
 * Chanomhub SDK - Favorites Repository
 */

import type { RestFetcher } from '../client';
import type { Article } from '../types/article';

/** Favorite response from API */
export interface FavoriteResponse {
    article: Article;
}

export interface FavoritesRepository {
    /** Add article to favorites */
    add(slug: string): Promise<FavoriteResponse | null>;

    /** Remove article from favorites */
    remove(slug: string): Promise<FavoriteResponse | null>;
}

/**
 * Creates a favorites repository with the given REST client
 */
export function createFavoritesRepository(fetcher: RestFetcher): FavoritesRepository {
    async function add(slug: string): Promise<FavoriteResponse | null> {
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
