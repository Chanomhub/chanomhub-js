/**
 * Chanomhub SDK - Downloads Repository
 *
 * Provides API methods for managing download links.
 */

import type { GraphQLFetcher, RestFetcher } from '../client';
import type { ChanomhubConfig } from '../config';
import { AuthenticationError } from '../errors';
import { resolveDownloadUrl } from '../transforms/downloadUrl';
import type {
    DownloadLink,
    CreateDownloadLinkRequest,
    UpdateDownloadLinkRequest,
    ModerateDownloadLinkRequest,
    DownloadLinkResponse,
    DownloadLinksListResponse,
    ListDownloadsOptions,
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
 * Helper to transform and add metadata to download links using backend provided 'type'
 */
function transformDownload<T extends { url: string; type?: string }>(
    download: T,
    storageDownloadUrl?: string,
): T & { isPurchaseRedirect: boolean; isDirectFile: boolean } {
    const originalUrl = download.url;
    // Resolve relative storage URLs (e.g., "public/abc.zip")
    const resolvedUrl = resolveDownloadUrl(originalUrl, storageDownloadUrl) || originalUrl;

    // Rely on the type provided by the backend, or fallback to DIRECT_FILE if missing
    const isPurchaseRedirect = download.type === 'PURCHASE_REDIRECT';
    const isDirectFile = download.type === 'DIRECT_FILE';

    return {
        ...download,
        url: resolvedUrl,
        isPurchaseRedirect,
        isDirectFile,
    } as any;
}

/**
 * Creates a downloads repository with the given REST client
 */
export function createDownloadsRepository(
    rest: RestFetcher,
    graphql: GraphQLFetcher,
    config: ChanomhubConfig,
): DownloadsRepository {
    const storageDownloadUrl = config.storageDownloadUrl;

    function requireAuth(): void {
        if (!config.token) {
            throw new AuthenticationError(
                'Authentication required for downloads management. Use createAuthenticatedClient() or provide a token.',
            );
        }
    }

    async function create(data: CreateDownloadLinkRequest): Promise<DownloadLink | null> {
        requireAuth();

        const { data: response, error } = await rest<DownloadLinkResponse>('/api/downloads', {
            method: 'POST',
            body: data,
        });

        if (error) {
            console.error('Failed to create download link:', error);
            return null;
        }

        return response?.downloadLink ? transformDownload(response.downloadLink, storageDownloadUrl) : null;
    }

    async function getAll(
        options?: ListDownloadsOptions,
    ): Promise<DownloadLinksListResponse | null> {
        requireAuth();

        const params = new URLSearchParams();
        if (options?.status) params.set('status', options.status);
        if (options?.articleId) params.set('articleId', String(options.articleId));
        if (options?.page) params.set('page', String(options.page));
        if (options?.limit) params.set('limit', String(options.limit));

        const queryString = params.toString();
        const url = `/api/downloads${queryString ? `?${queryString}` : ''}`;

        const { data, error } = await rest<DownloadLinksListResponse>(url, { method: 'GET' });

        if (error) {
            console.error('Failed to get download links:', error);
            return null;
        }

        if (data && data.items) {
            data.items = data.items.map((d) => transformDownload(d, storageDownloadUrl));
        }

        return data;
    }

    async function getByArticle(articleId: number): Promise<DownloadLink[]> {
        const query = `query GetArticleDownloads($articleId: Int!) {
      public {
        article(id: $articleId) {
          downloads {
            id
            name
            url
            isActive
            vipOnly
            forVersion
            createdAt
            updatedAt
          }
        }
      }
    }`;

        const { data, errors } = await graphql<{
            public: { article: { downloads: DownloadLink[] } };
        }>(query, { articleId }, { operationName: 'GetArticleDownloads' });

        if (errors || !data) {
            console.error('Failed to get download links for article:', errors);
            return [];
        }

        const downloads = data.public.article?.downloads ?? [];
        return downloads.map((d) => transformDownload(d, storageDownloadUrl));
    }

    async function getPending(page = 1, limit = 20): Promise<DownloadLinksListResponse | null> {
        requireAuth();

        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', String(limit));

        const { data, error } = await rest<DownloadLinksListResponse>(
            `/api/downloads/pending?${params.toString()}`,
            { method: 'GET' },
        );

        if (error) {
            console.error('Failed to get pending download links:', error);
            return null;
        }

        if (data && data.items) {
            data.items = data.items.map((d) => transformDownload(d, storageDownloadUrl));
        }

        return data;
    }

    async function moderate(
        id: number,
        moderationData: ModerateDownloadLinkRequest,
    ): Promise<DownloadLink | null> {
        requireAuth();

        const { data: response, error } = await rest<DownloadLinkResponse>(
            `/api/downloads/${id}/moderate`,
            { method: 'PATCH', body: moderationData },
        );

        if (error) {
            console.error('Failed to moderate download link:', error);
            return null;
        }

        return response?.downloadLink ? transformDownload(response.downloadLink, storageDownloadUrl) : null;
    }

    async function getById(id: number): Promise<DownloadLink | null> {
        const { data, error } = await rest<DownloadLink>(`/api/downloads/${id}`, { method: 'GET' });

        if (error || !data) {
            console.error('Failed to get download link:', error);
            return null;
        }

        return transformDownload(data, storageDownloadUrl);
    }

    async function update(
        id: number,
        updateData: UpdateDownloadLinkRequest,
    ): Promise<DownloadLink | null> {
        requireAuth();

        const { data: response, error } = await rest<DownloadLinkResponse>(`/api/downloads/${id}`, {
            method: 'PATCH',
            body: updateData,
        });

        if (error) {
            console.error('Failed to update download link:', error);
            return null;
        }

        return response?.downloadLink ? transformDownload(response.downloadLink, storageDownloadUrl) : null;
    }

    async function deleteDownload(id: number): Promise<boolean> {
        requireAuth();

        const { error } = await rest<void>(`/api/downloads/${id}`, { method: 'DELETE' });

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
