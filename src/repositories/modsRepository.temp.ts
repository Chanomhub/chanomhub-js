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
     * Create a new mod
     * @param data - Mod data
     * @returns Created mod
     */
    create(data: CreateModDTO): Promise<Mod>;
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

    async function create(_data: CreateModDTO): Promise<Mod> {
        requireAuth();

        // The endpoint is /api/mods/article/:slug but the DTO has articleId.
        // Wait, the frontend code used: /api/mods/article/${slug}
        // But the DTO in frontend has articleId: number.
        // The Articles API usually takes slug or ID.
        // Let's check how we can get slug if we only have ID, OR if there is an endpoint that takes ID.
        // If the SDK structure follows the existing pattern, maybe we should ask for slug in create() arguments?
        // The frontend `AddModDialog` has `slug` available.
        // So `create(slug: string, data: CreateModDTO)` would be better.
        // But let's look at `data`.

        // Actually, looking at existing repositories, `create` usually takes just DTO.
        // But if the route depends on slug, we need it.
        // Let's assume we change signature to `create(slug: string, data: CreateModDTO)`.

        throw new Error('Method not implemented correctly yet - checking path requirements');
    }

    return {
        create,
    };
}
