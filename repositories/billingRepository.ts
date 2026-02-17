/**
 * Chanomhub SDK - Billing Repository
 *
 * Provides API methods for usage tracking and billing management via backend proxy.
 */

import type { RestFetcher } from '../client';
import type { ChanomhubConfig } from '../config';
import { AuthenticationError } from '../errors';
import type { TrackUsageRequest, TrackUsageResponse } from '../types/billing';

export interface BillingRepository {
    /**
     * Track a usage event for billing
     * @param data - Event data (code, properties)
     * @returns Success status and transaction details
     */
    track(data: TrackUsageRequest): Promise<TrackUsageResponse>;
}

/**
 * Creates a billing repository with the given REST client
 */
export function createBillingRepository(
    fetcher: RestFetcher,
    config: ChanomhubConfig,
): BillingRepository {
    function requireAuth(): void {
        if (!config.token) {
            throw new AuthenticationError(
                'Authentication required for billing operations. Use createAuthenticatedClient() or provide a token.',
            );
        }
    }

    async function track(data: TrackUsageRequest): Promise<TrackUsageResponse> {
        requireAuth();

        const { data: response, error } = await fetcher<TrackUsageResponse>(
            '/api/v2/billing/track',
            { method: 'POST', body: data as unknown as Record<string, unknown> },
        );

        if (error) {
            console.error('Failed to track usage:', error);
            return { success: false };
        }

        return response ?? { success: true };
    }

    return {
        track,
    };
}
