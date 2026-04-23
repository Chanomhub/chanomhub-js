/**
 * Chanomhub SDK - Tags Repository
 */

import type { RestFetcher } from '../client';

export interface TagsRepository {
    /**
     * Get all available tags
     * 
     * @param all - If true, returns all tags. If false (default), returns only tags with at least 2 articles.
     * @returns List of tag names
     */
    getAll(all?: boolean): Promise<string[]>;
}

/**
 * Creates a tags repository with the given REST client
 */
export function createTagsRepository(rest: RestFetcher): TagsRepository {
    async function getAll(all: boolean = false): Promise<string[]> {
        const res = await rest<{ tags: string[] }>(`/api/tags${all ? '?all=true' : ''}`);

        if (res.error || !res.data) {
            console.error('Failed to fetch tags:', res.error);
            return [];
        }

        return res.data.tags;
    }

    return {
        getAll,
    };
}
