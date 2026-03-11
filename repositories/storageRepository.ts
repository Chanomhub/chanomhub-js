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

/** Multipart upload initiation response */
export interface InitiateMultipartResponse {
    uploadId: string;
    key: string;
    bucket: string;
    isVideo: boolean;
}

/** Multipart upload part response */
export interface UploadPartResponse {
    etag: string;
}

/** Completed part for multipart upload */
export interface CompletedPart {
    partNumber: number;
    etag: string;
}

export interface UploadOptions {
...
    /** Progress callback (browser only) */
    onProgress?: (percent: number) => void;
    /** Chunk size for multipart upload (default 5MB) */
    chunkSize?: number;
    /** Number of concurrent chunk uploads (default 3) */
    concurrentUploads?: number;
}

export interface StorageRepository {
    /**
     * Upload a file to the storage service (Simple upload, <100MB recommended)
     * @param file - File or Blob to upload
     * @param options - Upload options (bucket, path, progress callback)
     * @returns Upload response with URL and metadata
     */
    upload(file: File | Blob, options?: UploadOptions): Promise<UploadResponse>;

    /**
     * High-level multipart upload (Recommended for files >100MB)
     * @param file - File or Blob to upload
     * @param options - Upload options (bucket, path, chunkSize, progress callback)
     * @returns Upload response with URL and metadata
     */
    uploadMultipart(file: File | Blob, options?: UploadOptions): Promise<UploadResponse>;

    /**
     * Initiate a multipart upload
     */
    initiateMultipartUpload(filename: string, contentType: string, options?: UploadOptions): Promise<InitiateMultipartResponse>;

    /**
     * Upload a single part of a multipart upload
     */
    uploadPart(
        partData: Blob | ArrayBuffer,
        partNumber: number,
        initiateData: InitiateMultipartResponse,
        options?: UploadOptions
    ): Promise<UploadPartResponse>;

    /**
     * Complete a multipart upload
     */
    completeMultipartUpload(
        initiateData: InitiateMultipartResponse,
        parts: CompletedPart[],
        options?: UploadOptions
    ): Promise<UploadResponse>;

    /**
     * Abort a multipart upload
     */
    abortMultipartUpload(initiateData: InitiateMultipartResponse, options?: UploadOptions): Promise<void>;

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

    function getAuthHeaders(): Record<string, string> {
        return {
            'Authorization': `Bearer Bearer ${config.token}`,
        };
    }

    async function upload(file: File | Blob, options: UploadOptions = {}): Promise<UploadResponse> {
        requireAuth();

        const { bucket = 'images', path, game } = options;
        const storageUrl = config.storageServiceUrl || 'https://oi.chanomhub.com';

        const formData = new FormData();
        // GOR2 expects 'image' or 'file' key
        const fieldName = (file instanceof File && file.type.startsWith('image/')) ? 'image' : 'file';
        formData.append(fieldName, file);

        const url = new URL(`${storageUrl}/upload`);
        if (bucket) url.searchParams.append('bucket', bucket);
        if (path) url.searchParams.append('path', path);
        if (game) url.searchParams.append('game', game);

        try {
            const response = await fetch(url.toString(), {
                method: 'POST',
                headers: getAuthHeaders(),
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || errorData.message || `Upload failed with status ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Storage upload error:', error);
            throw error;
        }
    }

    async function initiateMultipartUpload(
        filename: string, 
        contentType: string, 
        options: UploadOptions = {}
    ): Promise<InitiateMultipartResponse> {
        requireAuth();
        const { bucket = 'storage', path, game } = options;
        const storageUrl = config.storageServiceUrl || 'https://oi.chanomhub.com';

        const url = new URL(`${storageUrl}/upload/initiate`);
        url.searchParams.append('filename', filename);
        url.searchParams.append('contentType', contentType);
        if (bucket) url.searchParams.append('bucket', bucket);
        if (path) url.searchParams.append('path', path);
        if (game) url.searchParams.append('game', game);

        const response = await fetch(url.toString(), {
            method: 'POST',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Failed to initiate multipart upload: ${response.status}`);
        }

        return await response.json();
    }

    async function uploadPart(
        partData: Blob | ArrayBuffer,
        partNumber: number,
        initiateData: InitiateMultipartResponse,
        options: UploadOptions = {}
    ): Promise<UploadPartResponse> {
        requireAuth();
        const storageUrl = config.storageServiceUrl || 'https://oi.chanomhub.com';
        const { bucket: bucketType = 'storage' } = options;

        const url = new URL(`${storageUrl}/upload/part`);
        url.searchParams.append('uploadId', initiateData.uploadId);
        url.searchParams.append('key', initiateData.key);
        url.searchParams.append('bucket', initiateData.bucket);
        url.searchParams.append('partNumber', partNumber.toString());
        url.searchParams.append('isVideo', initiateData.isVideo.toString());
        url.searchParams.append('bucketType', bucketType);

        const response = await fetch(url.toString(), {
            method: 'POST',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/octet-stream',
            },
            body: partData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Failed to upload part ${partNumber}: ${response.status}`);
        }

        return await response.json();
    }

    async function completeMultipartUpload(
        initiateData: InitiateMultipartResponse,
        parts: CompletedPart[],
        options: UploadOptions = {}
    ): Promise<UploadResponse> {
        requireAuth();
        const storageUrl = config.storageServiceUrl || 'https://oi.chanomhub.com';
        const { bucket: bucketType = 'storage' } = options;

        const url = new URL(`${storageUrl}/upload/complete`);

        const response = await fetch(url.toString(), {
            method: 'POST',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                uploadId: initiateData.uploadId,
                key: initiateData.key,
                bucket: initiateData.bucket,
                parts,
                isVideo: initiateData.isVideo,
                bucketType,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Failed to complete multipart upload: ${response.status}`);
        }

        return await response.json();
    }

    async function abortMultipartUpload(
        initiateData: InitiateMultipartResponse, 
        options: UploadOptions = {}
    ): Promise<void> {
        requireAuth();
        const storageUrl = config.storageServiceUrl || 'https://oi.chanomhub.com';
        const { bucket: bucketType = 'storage' } = options;

        const url = new URL(`${storageUrl}/upload/abort`);
        url.searchParams.append('uploadId', initiateData.uploadId);
        url.searchParams.append('key', initiateData.key);
        url.searchParams.append('bucket', initiateData.bucket);
        url.searchParams.append('isVideo', initiateData.isVideo.toString());
        url.searchParams.append('bucketType', bucketType);

        const response = await fetch(url.toString(), {
            method: 'POST',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Failed to abort multipart upload: ${response.status}`);
        }
    }

    async function uploadMultipart(file: File | Blob, options: UploadOptions = {}): Promise<UploadResponse> {
        const { 
            chunkSize = 5 * 1024 * 1024, // 5MB default chunk size
            onProgress,
            concurrentUploads = 3 
        } = options;

        const filename = (file as File).name || 'blob';
        const contentType = file.type || 'application/octet-stream';
        
        // 1. Initiate
        const initiateData = await initiateMultipartUpload(filename, contentType, options);
        
        try {
            const totalChunks = Math.ceil(file.size / chunkSize);
            const completedParts: CompletedPart[] = [];
            let uploadedBytes = 0;

            // Simple worker-pool approach for concurrent uploads
            const uploadChunk = async (chunkIndex: number) => {
                const start = chunkIndex * chunkSize;
                const end = Math.min(start + chunkSize, file.size);
                const chunk = file.slice(start, end);
                
                const partNumber = chunkIndex + 1;
                const { etag } = await uploadPart(chunk, partNumber, initiateData, options);
                
                completedParts.push({ partNumber, etag });
                
                uploadedBytes += (end - start);
                if (onProgress) {
                    onProgress(Math.round((uploadedBytes / file.size) * 100));
                }
            };

            // Process chunks in batches
            for (let i = 0; i < totalChunks; i += concurrentUploads) {
                const batch = [];
                for (let j = 0; j < concurrentUploads && i + j < totalChunks; j++) {
                    batch.push(uploadChunk(i + j));
                }
                await Promise.all(batch);
            }

            // 2. Complete
            // Parts must be sorted by partNumber
            completedParts.sort((a, b) => a.partNumber - b.partNumber);
            return await completeMultipartUpload(initiateData, completedParts, options);
            
        } catch (error) {
            // 3. Abort on failure
            await abortMultipartUpload(initiateData, options).catch(console.error);
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
