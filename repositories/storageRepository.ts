/**
 * Chanomhub SDK - Storage Repository
 */

import type { ChanomhubConfig } from '../config';
import { AuthenticationError } from '../errors';

/** Upload response from storage service */
export interface UploadResponse {
    /** Final URL of the uploaded file */
    url: string;
    /** File name */
    filename: string;
    /** Original file name */
    originalname: string;
    /** MIME type */
    mimetype: string;
    /** File size in bytes */
    size: number;
    /** Storage bucket used */
    bucket: string;
}

export interface UploadOptions {
    /**
     * Target bucket.
     * 'images' - Default (Images only, 10MB limit)
     * 'storage' - General storage/Games (Any type, 1GB limit)
     */
    bucket?: 'images' | 'storage';
    /**
     * Path prefix for the file (e.g. 'public', 'premium').
     * Useful for organizing files and protecting access.
     */
    path?: string;
    /**
     * Game slug or identifier for better file organization.
     * Example: 'elden-ring'
     */
    game?: string;
    /** Progress callback (browser only) */
    onProgress?: (percent: number) => void;
}

export interface StorageRepository {
    /**
     * Upload a file to the storage service
     * @param file - File or Blob to upload
     * @param options - Upload options (bucket, path, progress callback)
     * @returns Upload response with URL and metadata
     */
    upload(file: File | Blob, options?: UploadOptions): Promise<UploadResponse>;

    /**
     * Construct a protected download URL for premium content
     * @param path - File path (e.g. 'premium/hash.zip')
     * @param articleId - ID of the article to check purchase for
     * @returns Full URL with JWT token and articleId
     */
    getProtectedUrl(path: string, articleId?: number | string): string;
}

/**
 * Creates a storage repository
 */
export function createStorageRepository(config: ChanomhubConfig): StorageRepository {
    function requireAuth(): void {
        if (!config.token) {
            throw new AuthenticationError(
                'Authentication required for storage operations. Use createAuthenticatedClient() or provide a token.',
            );
        }
    }

    async function upload(file: File | Blob, options: UploadOptions = {}): Promise<UploadResponse> {
        requireAuth();

        const { bucket = 'images', path, game } = options;
        const storageUrl = config.storageServiceUrl || 'https://oi.chanomhub.com';

        const formData = new FormData();
        formData.append('file', file);

        const url = new URL(`${storageUrl}/upload`);
        if (bucket) {
            url.searchParams.append('bucket', bucket);
        }
        if (path) {
            url.searchParams.append('path', path);
        }
        if (game) {
            url.searchParams.append('game', game);
        }

        const headers: Record<string, string> = {
            // NOTE: We use double prefix to match GOR2 middleware expectations: Bearer Bearer {token}
            // This is for compatibility with existing client behavior
            'Authorization': `Bearer Bearer ${config.token}`,
        };

        try {
            const response = await fetch(url.toString(), {
                method: 'POST',
                headers,
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Upload failed with status ${response.status}`);
            }

            const data = await response.json();
            return data as UploadResponse;
        } catch (error) {
            console.error('Storage upload error:', error);
            throw error;
        }
    }

    function getProtectedUrl(path: string, articleId?: number | string): string {
        const gatewayUrl = config.downloadGatewayUrl || 'https://dl.chanomhub.com';
        
        // Clean path (remove leading slash if present)
        const cleanPath = path.startsWith('/') ? path.slice(1) : path;
        
        const url = new URL(`${gatewayUrl}/${cleanPath}`);
        
        // If we have a token, append it to the query for easy clicking in <a> tags
        if (config.token) {
            url.searchParams.append('token', config.token);
        }
        
        // Add articleId if provided for purchase validation
        if (articleId) {
            url.searchParams.append('articleId', articleId.toString());
        }
        
        return url.toString();
    }

    return {
        upload,
        getProtectedUrl,
    };
}
