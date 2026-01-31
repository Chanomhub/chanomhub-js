/**
 * Image URL Transformation
 *
 * Transforms filename-only URLs to full CDN URLs
 */

/** Default storage URL for source images */
const DEFAULT_STORAGE_URL = 'https://cdn.chanomhub.com';

/**
 * Resolves an image URL using imgproxy format.
 * - If it's just a filename (e.g., "abc.jpg"), creates an imgproxy URL
 * - If it's already a full URL, returns it as-is
 * - Handles null/undefined gracefully
 * 
 * imgproxy URL format: {cdnUrl}/insecure/plain/{sourceUrl}@webp
 */
export function resolveImageUrl(
    imageUrl: string | null | undefined,
    cdnUrl: string,
    storageUrl: string = DEFAULT_STORAGE_URL,
): string | null {
    if (!imageUrl) return null;

    // Already a full URL - return as-is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
    }

    // Build the source URL
    const sourceUrl = `${storageUrl}/${imageUrl}`;

    // Build imgproxy URL: /insecure/plain/{sourceUrl}@webp
    // - insecure: no signature (configure imgproxy to allow this or use signed URLs)
    // - plain: source URL is provided as-is (URL-encoded)
    // - @webp: convert to webp format for better compression
    const encodedSourceUrl = encodeURIComponent(sourceUrl);
    return `${cdnUrl}/insecure/plain/${encodedSourceUrl}@webp`;
}

/**
 * Generates a fallback URL (original source) for an image.
 * Useful when the CDN is unavailable or fails to load.
 * 
 * For imgproxy URLs, extracts the original source URL from the path.
 * imgproxy URL format: {cdnUrl}/insecure/plain/{encodedSourceUrl}@{format}
 *
 * @param imageUrl - The full image URL (potentially from imgproxy) or filename
 * @param cdnUrl - The imgproxy base URL to detect
 * @param storageUrl - The original storage base URL (optional, used for filename-only inputs)
 */
export function getFallbackUrl(
    imageUrl: string | null | undefined,
    cdnUrl: string,
    storageUrl: string = DEFAULT_STORAGE_URL,
): string | null {
    if (!imageUrl) return null;

    // If it's an imgproxy URL, extract the source URL
    if (imageUrl.startsWith(cdnUrl)) {
        // Parse imgproxy URL: {cdnUrl}/insecure/plain/{encodedSourceUrl}@{format}
        const plainMatch = imageUrl.match(/\/plain\/([^@]+)(?:@\w+)?$/);
        if (plainMatch) {
            // Decode the source URL
            return decodeURIComponent(plainMatch[1]);
        }

        // If it's a base64 encoded URL (no /plain/), try to decode
        const base64Match = imageUrl.match(/\/insecure\/([^.]+)(?:\.\w+)?$/);
        if (base64Match) {
            try {
                return Buffer.from(base64Match[1], 'base64url').toString('utf-8');
            } catch {
                // Failed to decode, return as-is
            }
        }

        return imageUrl;
    }

    // If it's another full URL (not our CDN), return as-is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
    }

    // Filename only - prepend storage URL
    return `${storageUrl}/${imageUrl}`;
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
