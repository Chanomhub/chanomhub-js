/**
 * Image URL Transformation
 *
 * Transforms filename-only URLs to full CDN URLs
 */

/**
 * Resolves an image URL.
 * - If it's just a filename (e.g., "abc.jpg"), prepends the CDN base URL
 * - If it's already a full URL, returns it as-is
 * - Handles null/undefined gracefully
 */
export function resolveImageUrl(
    imageUrl: string | null | undefined,
    cdnUrl: string,
): string | null {
    if (!imageUrl) return null;

    // Already a full URL - return as-is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
    }

    // Filename only - prepend CDN base URL
    return `${cdnUrl}/${imageUrl}`;
}

/**
 * Generates a fallback URL (original source) for an image.
 * Useful when the CDN is unavailable or fails to load.
 *
 * @param imageUrl - The full image URL (potentially from CDN) or filename
 * @param cdnUrl - The CDN base URL to strip (if present)
 * @param storageUrl - The original storage base URL to prepend
 */
export function getFallbackUrl(
    imageUrl: string | null | undefined,
    cdnUrl: string,
    storageUrl?: string,
): string | null {
    if (!imageUrl) return null;

    let filename = imageUrl;

    // If it's a full CDN URL, strip the CDN prefix
    if (imageUrl.startsWith(cdnUrl)) {
        // Remove cdnUrl and any leading slash
        const relativePath = imageUrl.slice(cdnUrl.length);
        filename = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
    } else if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        // If it's another full URL (not our CDN), return as-is or null?
        // Assume if it's not our CDN, we can't fallback easily unless it's just a filename
        // But if the input was already just a filename, we use it.
        // If it is some other external URL, we probably just return it as is or null.
        // For safety, if it doesn't start with CDN url, and is a full url, we assume it might already be the fallback or external.
        return imageUrl;
    }

    // Prepend storage URL if available
    if (storageUrl) {
        return `${storageUrl}/${filename}`;
    }

    return filename;
}

/** Known image field names */
const IMAGE_FIELDS = new Set(['mainImage', 'backgroundImage', 'coverImage', 'image']);

/**
 * Deep transforms all image URLs in an object/array recursively.
 */
export function transformImageUrlsDeep<T>(data: T, cdnUrl: string): T {
    if (data === null || data === undefined) return data;

    if (Array.isArray(data)) {
        return data.map((item) => transformImageUrlsDeep(item, cdnUrl)) as T;
    }

    if (typeof data === 'object') {
        const result: Record<string, unknown> = {};

        for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
            // Transform known image URL fields
            if (IMAGE_FIELDS.has(key) && typeof value === 'string') {
                result[key] = resolveImageUrl(value, cdnUrl);
            }
            // Transform image objects with url property (e.g., images: [{ url: 'abc.jpg' }])
            else if (key === 'images' && Array.isArray(value)) {
                result[key] = value.map((img) => {
                    if (img && typeof img === 'object' && 'url' in img) {
                        return { ...img, url: resolveImageUrl(img.url as string, cdnUrl) };
                    }
                    return img;
                });
            }
            // Recursively transform nested objects
            else if (value !== null && typeof value === 'object') {
                result[key] = transformImageUrlsDeep(value, cdnUrl);
            } else {
                result[key] = value;
            }
        }

        return result as T;
    }

    return data;
}
