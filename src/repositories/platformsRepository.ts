/**
 * Chanomhub SDK - Platforms Repository
 */

import type { RestFetcher } from '../client';

export interface PlatformsRepository {
    /**
     * Get all available platforms
     * 
     * @returns List of platform names
     */
    getAll(): Promise<string[]>;
}

/**
 * Creates a platforms repository with the given REST client
 */
export function createPlatformsRepository(rest: RestFetcher): PlatformsRepository {
    async function getAll(): Promise<string[]> {
        const res = await rest<{ platforms: string[] }>('/api/platforms');

        if (res.error || !res.data) {
            console.error('Failed to fetch platforms:', res.error);
            return [];
        }

        return res.data.platforms;
    }

    return {
        getAll,
    };
}
