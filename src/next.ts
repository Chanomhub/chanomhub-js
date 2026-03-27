/**
 * Chanomhub SDK - Next.js Helpers
 *
 * Optional module for Next.js-specific functionality.
 * Import from '@/lib/chanomhub-sdk/next' only in Next.js projects.
 *
 * @example
 * ```typescript
 * // In a Next.js Server Component
 * import { createServerClient } from '@/lib/chanomhub-sdk/next';
 *
 * const sdk = await createServerClient();
 * const articles = await sdk.articles.getAll();
 * ```
 */

import { createChanomhubClient, type ChanomhubClient, type ChanomhubConfig } from './index';

/**
 * Creates a server-side Chanomhub client for Next.js
 * Automatically reads authentication token from cookies
 *
 * @param config - Optional configuration overrides
 * @returns Promise<ChanomhubClient>
 */
export async function createServerClient(
    config: Partial<ChanomhubConfig> = {},
): Promise<ChanomhubClient> {
    // Dynamic import to avoid bundling next/headers in non-Next.js environments
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    return createChanomhubClient({
        ...config,
        token,
        // Disable cache when authenticated
        defaultCacheSeconds: token ? 0 : config.defaultCacheSeconds,
    });
}

/**
 * Gets the current auth token from Next.js cookies
 * Useful when you need to pass the token to client components
 */
export async function getAuthToken(): Promise<string | undefined> {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    return cookieStore.get('token')?.value;
}
