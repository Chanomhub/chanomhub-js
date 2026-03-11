/**
 * Image URL Transformation
 *
 * Transforms filename-only URLs to imgproxy URLs with processing options
 */

import { ImgproxyOptions, DEFAULT_IMGPROXY_OPTIONS } from '../config';

/** Default storage URL for source images */
const DEFAULT_STORAGE_URL = 'https://cdn.chanomhub.com';

/**
 * Builds the imgproxy processing options path from ImgproxyOptions
 * @see https://docs.imgproxy.net/usage/processing
 */
export function buildImgproxyPath(options: ImgproxyOptions = {}): string {
    const parts: string[] = [];

    // Resize: rs:%type:%width:%height:%enlarge
    if (options.resizeType || options.width || options.height || options.enlarge !== undefined) {
        const rs = [
            'rs',
            options.resizeType || 'fit',
            options.width ?? 0,
            options.height ?? 0,
            options.enlarge ? 1 : 0,
        ];
        parts.push(rs.join(':'));
    }

    // Quality: q:%quality
    if (options.quality && options.quality > 0) {
        parts.push(`q:${options.quality}`);
    }

    // Gravity: g:%gravity
    if (options.gravity) {
        parts.push(`g:${options.gravity}`);
    }

    // DPR: dpr:%dpr
    if (options.dpr && options.dpr > 1) {
        parts.push(`dpr:${options.dpr}`);
    }

    // Blur: bl:%sigma
    if (options.blur && options.blur > 0) {
        parts.push(`bl:${options.blur}`);
    }

    // Sharpen: sh:%sigma
    if (options.sharpen && options.sharpen > 0) {
        parts.push(`sh:${options.sharpen}`);
    }

    return parts.join('/');
}

/**
 * Resolves an image URL using imgproxy format.
 * - If it's just a filename (e.g., "abc.jpg"), creates an imgproxy URL
 * - If it's already a full URL, returns it as-is
 * - Handles null/undefined gracefully
 *
 * imgproxy URL format: {cdnUrl}/insecure/{options}/plain/{sourceUrl}@{format}
 *
 * @param imageUrl - Image filename or full URL
 * @param cdnUrl - Imgproxy base URL
 * @param storageUrl - Source image storage URL
 * @param options - Imgproxy processing options
 */
export function resolveImageUrl(
    imageUrl: string | null | undefined,
    cdnUrl: string,
    storageUrl: string = DEFAULT_STORAGE_URL,
    options: ImgproxyOptions = DEFAULT_IMGPROXY_OPTIONS,
): string | null {
    if (!imageUrl) return null;

    // Already a full URL - return as-is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
    }

    // Build the source URL
    const sourceUrl = `${storageUrl}/${imageUrl}`;

    // Build processing options path
    const optionsPath = buildImgproxyPath(options);

    // Get format (default: webp)
    const format = options.format || 'webp';

    // Build imgproxy URL: /insecure/{options}/plain/{sourceUrl}@{format}
    const encodedSourceUrl = encodeURIComponent(sourceUrl);

    if (optionsPath) {
        return `${cdnUrl}/insecure/${optionsPath}/plain/${encodedSourceUrl}@${format}`;
    }

    return `${cdnUrl}/insecure/plain/${encodedSourceUrl}@${format}`;
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

        // Skip transformation for objects that look like download links
        // (they have a 'url' but it's not an image, and they have 'vipOnly' or 'isActive')
        if ('url' in (data as any) && ('vipOnly' in (data as any) || 'isActive' in (data as any))) {
            return data;
        }

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
