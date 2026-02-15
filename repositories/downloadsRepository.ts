/**
 * Chanomhub SDK - Downloads Repository
 *
 * Provides API methods for managing download links.
 */

import type { RestFetcher } from '../client';
import type { ChanomhubConfig } from '../config';
import { AuthenticationError } from '../errors';
import type {
    DownloadLink,
    CreateDownloadLinkRequest,
    UpdateDownloadLinkRequest,
    ModerateDownloadLinkRequest,
    DownloadLinkResponse,
    DownloadLinksListResponse,
    ListDownloadsOptions,
    SourceStatus,
} from '../types/download';

export interface DownloadsRepository {
    /**
     * Create a new download link
     * @param data - Download link data
     * @returns Created download link
     */
    create(data: CreateDownloadLinkRequest): Promise<DownloadLink | null>;

    /**
     * Get all download links filtered by status (moderator/admin only)
     * @param options - Filter and pagination options
     * @returns Paginated list of download links
     */
    getAll(options?: ListDownloadsOptions): Promise<DownloadLinksListResponse | null>;

    /**
     * Get all download links for a specific article
     * @param articleId - Article ID
     * @returns Array of download links
     */
    getByArticle(articleId: number): Promise<DownloadLink[]>;

    /**
     * Get all pending download links with pagination (moderator/admin only)
     * @param page - Page number (default: 1)
     * @param limit - Items per page (default: 20)
     * @returns Paginated list of pending download links
     */
    getPending(page?: number, limit?: number): Promise<DownloadLinksListResponse | null>;

    /**
     * Moderate a download link (moderator/admin only)
     * @param id - Download link ID
     * @param data - Moderation data (status)
     * @returns Updated download link
     */
    moderate(id: number, data: ModerateDownloadLinkRequest): Promise<DownloadLink | null>;

    /**
     * Get a specific download link by ID
     * @param id - Download link ID
     * @returns Download link or null if not found
     */
    getById(id: number): Promise<DownloadLink | null>;

    /**
     * Update a download link
     * @param id - Download link ID
     * @param data - Update data
     * @returns Updated download link
     */
    update(id: number, data: UpdateDownloadLinkRequest): Promise<DownloadLink | null>;

    /**
     * Delete a download link
     * @param id - Download link ID
     * @returns True if deleted successfully
     */
    delete(id: number): Promise<boolean>;
}

/**
 * Creates a downloads repository with the given REST client
 */
export function createDownloadsRepository(
    fetcher: RestFetcher,
    config: ChanomhubConfig,
): DownloadsRepository {
    function requireAuth(): void {
        if (!config.token) {
            throw new AuthenticationError(
                'Authentication required for downloads management. Use createAuthenticatedClient() or provide a token.',
            );
        }
    }

    async function create(data: CreateDownloadLinkRequest): Promise<DownloadLink | null> {
        requireAuth();

        const { data: response, error } = await fetcher<DownloadLinkResponse>(
            '/api/downloads',
            { method: 'POST', body: data },
        );

        if (error) {
            console.error('Failed to create download link:', error);
            return null;
        }

        return response?.downloadLink ?? null;
    }

    async function getAll(options?: ListDownloadsOptions): Promise<DownloadLinksListResponse | null> {
        requireAuth();

        const params = new URLSearchParams();
        if (options?.status) params.set('status', options.status);
        if (options?.articleId) params.set('articleId', String(options.articleId));
        if (options?.page) params.set('page', String(options.page));
        if (options?.limit) params.set('limit', String(options.limit));

        const queryString = params.toString();
        const url = `/api/downloads${queryString ? `?${queryString}` : ''}`;

        const { data, error } = await fetcher<DownloadLinksListResponse>(url, { method: 'GET' });

        if (error) {
            console.error('Failed to get download links:', error);
            return null;
        }

        return data;
    }

    async function getByArticle(articleId: number): Promise<DownloadLink[]> {
        const { data, error } = await fetcher<DownloadLink[]>(
            `/api/downloads/article/${articleId}`,
            { method: 'GET' },
        );

        if (error) {
            console.error('Failed to get download links for article:', error);
            return [];
        }

        return data ?? [];
    }

    async function getPending(page = 1, limit = 20): Promise<DownloadLinksListResponse | null> {
        requireAuth();

        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', String(limit));

        const { data, error } = await fetcher<DownloadLinksListResponse>(
            `/api/downloads/pending?${params.toString()}`,
            { method: 'GET' },
        );

        if (error) {
            console.error('Failed to get pending download links:', error);
            return null;
        }

        return data;
    }

    async function moderate(id: number, moderationData: ModerateDownloadLinkRequest): Promise<DownloadLink | null> {
        requireAuth();

        const { data: response, error } = await fetcher<DownloadLinkResponse>(
            `/api/downloads/${id}/moderate`,
            { method: 'PATCH', body: moderationData },
        );

        if (error) {
            console.error('Failed to moderate download link:', error);
            return null;
        }

        return response?.downloadLink ?? null;
    }

    async function getById(id: number): Promise<DownloadLink | null> {
        const { data, error } = await fetcher<DownloadLink>(
            `/api/downloads/${id}`,
            { method: 'GET' },
        );

        if (error) {
            console.error('Failed to get download link:', error);
            return null;
        }

        return data;
    }

    async function update(id: number, updateData: UpdateDownloadLinkRequest): Promise<DownloadLink | null> {
        requireAuth();

        const { data: response, error } = await fetcher<DownloadLinkResponse>(
            `/api/downloads/${id}`,
            { method: 'PATCH', body: updateData },
        );

        if (error) {
            console.error('Failed to update download link:', error);
            return null;
        }

        return response?.downloadLink ?? null;
    }

    async function deleteDownload(id: number): Promise<boolean> {
        requireAuth();

        const { error } = await fetcher<void>(
            `/api/downloads/${id}`,
            { method: 'DELETE' },
        );

        if (error) {
            console.error('Failed to delete download link:', error);
            return false;
        }

        return true;
    }

    return {
        create,
        getAll,
        getByArticle,
        getPending,
        moderate,
        getById,
        update,
        delete: deleteDownload,
    };
}
