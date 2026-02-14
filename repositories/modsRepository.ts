/**
 * Chanomhub SDK - Mods Repository
 */

import type { RestFetcher } from '../client';
import type { ChanomhubConfig } from '../config';
import type { Mod } from '../types/common';
import type { CreateModDTO } from '../types/mod';
import { AuthenticationError } from '../errors';

export interface ModsRepository {
    /**
     * Create a new mod for an article
     * @param slug - Article slug
     * @param data - Mod data
     * @returns Created mod
     */
    create(slug: string, data: CreateModDTO): Promise<Mod>;
}

/**
 * Creates a mods repository with the given REST client
 */
export function createModsRepository(
    fetcher: RestFetcher,
    config: ChanomhubConfig,
): ModsRepository {
    function requireAuth(): void {
        if (!config.token) {
            throw new AuthenticationError(
                'Authentication required for mods management. Use createAuthenticatedClient() or provide a token.',
            );
        }
    }

    async function create(slug: string, data: CreateModDTO): Promise<Mod> {
        requireAuth();

        const { data: response, error } = await fetcher<{ mod: Mod }>(
            `/api/mods/article/${slug}`,
            {
                method: 'POST',
                body: data as unknown as Record<string, unknown>,
            },
        );

        if (error || !response) {
            throw new Error(error || 'Failed to create mod');
        }

        return response.mod;
    }

    return {
        create,
    };
}
