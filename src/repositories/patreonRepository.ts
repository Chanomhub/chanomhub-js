/**
 * Chanomhub SDK - Patreon Repository
 */

import type { RestFetcher } from '../client';
import type { PatreonAccount } from '../types/user';

export interface PatreonRepository {
    /**
     * Get the Patreon authorization URL to redirect the user to.
     */
    getAuthUrl(): Promise<{ url: string }>;

    /**
     * Sync the developer's Patreon campaign ID from their Patreon account.
     * Developer only.
     */
    syncCampaign(): Promise<{ campaignId: string }>;

    /**
     * Handle the Patreon OAuth callback.
     * 
     * @param code - The authorization code from Patreon
     * @param state - The state parameter from the redirect
     */
    handleCallback(code: string, state: string): Promise<PatreonAccount>;
}

/**
 * Creates a Patreon repository
 * 
 * @param fetcher - REST API fetcher
 */
export function createPatreonRepository(fetcher: RestFetcher): PatreonRepository {
    async function getAuthUrl(): Promise<{ url: string }> {
        const { data, error } = await fetcher<{ url: string }>('/api/patreon/auth');
        if (error) throw error;
        if (!data) throw new Error('No data returned from Patreon auth');
        return data;
    }

    async function syncCampaign(): Promise<{ campaignId: string }> {
        const { data, error } = await fetcher<{ campaignId: string }>('/api/patreon/sync-campaign');
        if (error) throw error;
        if (!data) throw new Error('No data returned from Patreon sync campaign');
        return data;
    }

    async function handleCallback(code: string, state: string): Promise<PatreonAccount> {
        const { data, error } = await fetcher<PatreonAccount>(`/api/patreon/callback?code=${code}&state=${state}`);
        if (error) throw error;
        if (!data) throw new Error('No data returned from Patreon callback');
        return data;
    }

    return {
        getAuthUrl,
        syncCampaign,
        handleCallback,
    };
}
