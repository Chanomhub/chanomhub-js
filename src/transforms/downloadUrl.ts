/**
 * Download URL Transformation
 *
 * Resolves relative storage paths to full download URLs
 */

import { DEFAULT_CONFIG } from '../config';

/** Default storage download URL */
const DEFAULT_STORAGE_DOWNLOAD_URL = DEFAULT_CONFIG.storageDownloadUrl || 'https://storage.chanomhub.com';

/**
 * Resolves a download URL.
 * - If it's a relative storage path (e.g. "public/abc.zip"), prepends storageDownloadUrl
 * - If it's already a full URL, returns it as-is
 * - Handles null/undefined gracefully
 *
 * @param url - Download path or full URL
 * @param storageDownloadUrl - Public storage base URL
 */
export function resolveDownloadUrl(
    url: string | null | undefined,
    storageDownloadUrl: string = DEFAULT_STORAGE_DOWNLOAD_URL,
): string | null {
    if (!url) return null;

    // Already a full URL - return as-is
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }

    // Relative path - prepend storage URL
    // Ensure no double slashes
    const baseUrl = storageDownloadUrl.endsWith('/') ? storageDownloadUrl.slice(0, -1) : storageDownloadUrl;
    const path = url.startsWith('/') ? url : `/${url}`;

    return `${baseUrl}${path}`;
}

/**
 * Deep transforms all download URLs in an object/array recursively.
 */
export function transformDownloadUrlsDeep<T>(data: T, storageDownloadUrl: string = DEFAULT_STORAGE_DOWNLOAD_URL): T {
    if (data === null || data === undefined) return data;

    if (Array.isArray(data)) {
        return data.map((item) => transformDownloadUrlsDeep(item, storageDownloadUrl)) as T;
    }

    if (typeof data === 'object') {
        const result: Record<string, unknown> = {};

        for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
            // Transform 'url' field if it's within a 'downloads' or 'officialDownloadSources' context
            // or if it's a field we know contains a download URL
            if (key === 'url' && typeof value === 'string' && !value.startsWith('http')) {
                // This is a bit aggressive, but typically in download objects, 'url' is the download link
                result[key] = resolveDownloadUrl(value, storageDownloadUrl);
            }
            // Recursively transform nested objects
            else if (value !== null && typeof value === 'object') {
                result[key] = transformDownloadUrlsDeep(value, storageDownloadUrl);
            } else {
                result[key] = value;
            }
        }

        return result as T;
    }

    return data;
}
