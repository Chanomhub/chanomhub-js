/**
 * Chanomhub SDK - Checkout Repository
 */

import type { GraphQLFetcher } from '../client';
import { ItemType } from '../types/common';

export interface CheckoutResponse {
    invoiceId: string;
    paymentUrl: string | null;
    status: string;
}

export interface CheckoutOptions {
    successUrl?: string;
    cancelUrl?: string;
}

export interface CheckoutRepository {
    /**
     * Create a one-off checkout for an article or mod
     * @param entityId - ID of the item to purchase
     * @param entityType - Type of the item (ARTICLE or MOD)
     * @param options - Optional redirect URLs
     * @returns Checkout response with payment URL
     */
    createCheckout(
        entityId: number,
        entityType: ItemType,
        options?: CheckoutOptions,
    ): Promise<CheckoutResponse>;

    /**
     * Convenience method to purchase an article
     * @param articleId - ID of the article
     * @param options - Optional redirect URLs
     */
    purchaseArticle(articleId: number, options?: CheckoutOptions): Promise<CheckoutResponse>;

    /**
     * Convenience method to purchase a mod
     * @param modId - ID of the mod
     * @param options - Optional redirect URLs
     */
    purchaseMod(modId: number, options?: CheckoutOptions): Promise<CheckoutResponse>;
}

/**
 * Creates a checkout repository with the given GraphQL client
 */
export function createCheckoutRepository(fetcher: GraphQLFetcher): CheckoutRepository {
    async function createCheckout(
        entityId: number,
        entityType: ItemType,
        options: CheckoutOptions = {},
    ): Promise<CheckoutResponse> {
        const query = `mutation CreateOneOffCheckout($entityId: Int!, $entityType: ItemType!, $successUrl: String, $cancelUrl: String) {
      createOneOffCheckout(entityId: $entityId, entityType: $entityType, successUrl: $successUrl, cancelUrl: $cancelUrl) {
        invoiceId
        paymentUrl
        status
      }
    }`;

        const { data, errors } = await fetcher<{ createOneOffCheckout: CheckoutResponse }>(
            query,
            {
                entityId,
                entityType,
                successUrl: options.successUrl,
                cancelUrl: options.cancelUrl,
            },
            {
                operationName: 'CreateOneOffCheckout',
            },
        );

        if (errors || !data) {
            throw new Error(errors?.[0]?.message || 'Failed to create checkout');
        }

        return data.createOneOffCheckout;
    }

    async function purchaseArticle(
        articleId: number,
        options?: CheckoutOptions,
    ): Promise<CheckoutResponse> {
        return createCheckout(articleId, ItemType.ARTICLE, options);
    }

    async function purchaseMod(modId: number, options?: CheckoutOptions): Promise<CheckoutResponse> {
        return createCheckout(modId, ItemType.MOD, options);
    }

    return {
        createCheckout,
        purchaseArticle,
        purchaseMod,
    };
}
