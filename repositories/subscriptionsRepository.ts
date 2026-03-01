/**
 * Chanomhub SDK - Subscriptions Repository
 *
 * Provides API methods for managing subscriptions and plans.
 */

import type { RestFetcher } from '../client';
import type { ChanomhubConfig } from '../config';
import { AuthenticationError } from '../errors';
import type {
    Subscription,
    SubscriptionPlan,
    CreateSubscriptionRequest,
    CreateSubscriptionPlanRequest,
} from '../types/subscription';

export interface SubscriptionsRepository {
    /**
     * Create a new subscription
     * @param data - Subscription data
     * @returns Created subscription
     */
    create(data: CreateSubscriptionRequest): Promise<Subscription | null>;

    /**
     * Get all user subscriptions
     * @returns List of subscriptions
     */
    getAll(): Promise<Subscription[]>;

    /**
     * Cancel a subscription
     * @param id - Subscription ID
     * @returns Cancelled subscription
     */
    cancel(id: number): Promise<Subscription | null>;

    /**
     * Create a new subscription plan (Admin only)
     * @param data - Subscription plan data
     * @returns Created subscription plan
     */
    createPlan(data: CreateSubscriptionPlanRequest): Promise<SubscriptionPlan | null>;

    /**
     * Get all available subscription plans
     * @param refresh - Force refresh (optional)
     * @returns List of subscription plans
     */
    getPlans(refresh?: boolean): Promise<SubscriptionPlan[]>;
}

/**
 * Creates a subscriptions repository with the given REST client
 */
export function createSubscriptionsRepository(
    fetcher: RestFetcher,
    config: ChanomhubConfig,
): SubscriptionsRepository {
    function requireAuth(): void {
        if (!config.token) {
            throw new AuthenticationError(
                'Authentication required for subscriptions management. Use createAuthenticatedClient() or provide a token.',
            );
        }
    }

    async function create(data: CreateSubscriptionRequest): Promise<Subscription | null> {
        requireAuth();

        const { data: response, error } = await fetcher<Subscription>('/api/subscriptions', {
            method: 'POST',
            body: data as unknown as Record<string, unknown>,
        });

        if (error) {
            console.error('Failed to create subscription:', error);
            return null;
        }

        return response;
    }

    async function getAll(): Promise<Subscription[]> {
        requireAuth();

        const { data, error } = await fetcher<Subscription[]>('/api/subscriptions', {
            method: 'GET',
        });

        if (error) {
            console.error('Failed to get subscriptions:', error);
            return [];
        }

        return data ?? [];
    }

    async function cancel(id: number): Promise<Subscription | null> {
        requireAuth();

        const { data: response, error } = await fetcher<Subscription>(`/api/subscriptions/${id}`, {
            method: 'DELETE',
        });

        if (error) {
            console.error('Failed to cancel subscription:', error);
            return null;
        }

        return response;
    }

    async function createPlan(
        data: CreateSubscriptionPlanRequest,
    ): Promise<SubscriptionPlan | null> {
        requireAuth();

        const { data: response, error } = await fetcher<SubscriptionPlan>(
            '/api/subscriptions/plans',
            { method: 'POST', body: data as unknown as Record<string, unknown> },
        );

        if (error) {
            console.error('Failed to create subscription plan:', error);
            return null;
        }

        return response;
    }

    async function getPlans(refresh?: boolean): Promise<SubscriptionPlan[]> {
        const url = refresh ? '/api/subscriptions/plans?refresh=true' : '/api/subscriptions/plans';

        const { data, error } = await fetcher<SubscriptionPlan[]>(url, { method: 'GET' });

        if (error) {
            console.error('Failed to get subscription plans:', error);
            return [];
        }

        return data ?? [];
    }

    return {
        create,
        getAll,
        cancel,
        createPlan,
        getPlans,
    };
}
