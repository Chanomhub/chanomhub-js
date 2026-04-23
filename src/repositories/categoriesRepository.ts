/**
 * Chanomhub SDK - Categories Repository
 */

import type { RestFetcher } from '../client';

export interface CategoriesRepository {
    /**
     * Get all available categories
     * 
     * @returns List of category names
     */
    getAll(): Promise<string[]>;
}

/**
 * Creates a categories repository with the given REST client
 */
export function createCategoriesRepository(rest: RestFetcher): CategoriesRepository {
    async function getAll(): Promise<string[]> {
        const res = await rest<{ categories: string[] }>('/api/categories');

        if (res.error || !res.data) {
            console.error('Failed to fetch categories:', res.error);
            return [];
        }

        return res.data.categories;
    }

    return {
        getAll,
    };
}
