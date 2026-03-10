/**
 * Chanomhub SDK - Download Types
 */

/** Source status for moderation */
export type SourceStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

/** Download link entity */
export interface DownloadLink {
    id: number;
    articleId: number;
    createdById?: number | null;
    name?: string | null;
    url: string;
    isActive: boolean;
    status: SourceStatus;
    vipOnly: boolean;
    forVersion?: string | null;
    createdAt: string;
    updatedAt: string;
    /** Whether this is a redirect link to purchase the article (pseudo-download) */
    isPurchaseRedirect?: boolean;
    /** Whether this is a direct downloadable file (zip, exe, etc.) */
    isDirectFile?: boolean;
    /** Included when expanded */
    createdBy?: {
        id: number;
        name: string;
    } | null;
}

/** Request to create a new download link */
export interface CreateDownloadLinkRequest {
    [key: string]: unknown;
    articleId: number;
    name?: string;
    url: string;
    vipOnly?: boolean;
    forVersion?: string;
}

/** Request to update a download link */
export interface UpdateDownloadLinkRequest {
    [key: string]: unknown;
    name?: string;
    url?: string;
    isActive?: boolean;
    vipOnly?: boolean;
    forVersion?: string;
}

/** Request to moderate a download link */
export interface ModerateDownloadLinkRequest {
    [key: string]: unknown;
    status: 'APPROVED' | 'REJECTED';
}

/** Response for create/update operations */
export interface DownloadLinkResponse {
    downloadLink: DownloadLink;
}

/** Paginated list of download links */
export interface DownloadLinksListResponse {
    items: DownloadLink[];
    total: number;
    page: number;
    pageSize: number;
}

/** Options for listing downloads */
export interface ListDownloadsOptions {
    status?: SourceStatus;
    articleId?: number;
    page?: number;
    limit?: number;
}
