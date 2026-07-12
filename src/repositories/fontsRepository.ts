/**
 * Chanomhub SDK - Fonts Repository
 */

import type { RestFetcher } from '../client';

export interface FontAsset {
    id: string;
    key: string;
    url: string;
    bucket: string;
    createdAt: string;
}

export interface FontRegistry {
    id: number;
    name: string;
    slug: string;
    engine: string;
    engineVersion: string | null;
    language: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    uploaderId: number;
    uploader?: { id: number; name: string; image: string | null };
    createdAt: string;
    updatedAt: string;
    assets?: FontAsset[];
}

export interface GetFontsParams {
    engine?: string;
    language?: string;
    search?: string;
    skip?: number;
    take?: number;
    status?: string;
}

export interface FontsRepository {
    /**
     * Get paginated list of approved/pending/rejected fonts
     */
    getFonts(params?: GetFontsParams): Promise<{ fonts: FontRegistry[]; totalCount: number }>;

    /**
     * Get details of a specific font entry
     */
    getFont(id: number): Promise<FontRegistry | null>;

    /**
     * Register a new font entry
     */
    createFont(data: {
        name: string;
        engine: string;
        language: string;
        engineVersion?: string;
    }): Promise<FontRegistry | null>;

    /**
     * Update font metadata
     */
    updateFont(id: number, data: {
        name?: string;
        engineVersion?: string;
    }): Promise<FontRegistry | null>;

    /**
     * Request R2 signed upload info for a file
     */
    requestUploadInfo(id: number, filename: string): Promise<{
        uploadUrl: string;
        token: string;
        method: string;
        fileKey: string;
        expectedUrl: string;
    } | null>;

    /**
     * Submit a font and its uploaded files for review
     */
    submitForReview(id: number, note?: string): Promise<FontRegistry | null>;

    /**
     * Approve a pending font entry (moderator only)
     */
    approveFont(id: number, note?: string): Promise<FontRegistry | null>;

    /**
     * Reject a pending font entry (moderator only)
     */
    rejectFont(id: number, note?: string): Promise<FontRegistry | null>;

    /**
     * Delete a font entry and its files
     */
    deleteFont(id: number): Promise<boolean>;
}

export function createFontsRepository(rest: RestFetcher): FontsRepository {
    async function getFonts(params: GetFontsParams = {}): Promise<{ fonts: FontRegistry[]; totalCount: number }> {
        const queryParams = new URLSearchParams();
        if (params.engine) queryParams.append('engine', params.engine);
        if (params.language) queryParams.append('language', params.language);
        if (params.search) queryParams.append('search', params.search);
        if (params.skip !== undefined) queryParams.append('skip', params.skip.toString());
        if (params.take !== undefined) queryParams.append('take', params.take.toString());
        if (params.status) queryParams.append('status', params.status);

        const res = await rest<{ fonts: FontRegistry[]; totalCount: number }>(`/api/fonts?${queryParams}`);

        if (res.error || !res.data) {
            console.error('Failed to fetch fonts:', res.error);
            return { fonts: [], totalCount: 0 };
        }

        return res.data;
    }

    async function getFont(id: number): Promise<FontRegistry | null> {
        const res = await rest<FontRegistry>(`/api/fonts/${id}`);
        if (res.error || !res.data) {
            console.error(`Failed to fetch font ${id}:`, res.error);
            return null;
        }
        return res.data;
    }

    async function createFont(data: {
        name: string;
        engine: string;
        language: string;
        engineVersion?: string;
    }): Promise<FontRegistry | null> {
        const res = await rest<FontRegistry>('/api/fonts', {
            method: 'POST',
            body: data as any,
        });
        if (res.error || !res.data) {
            console.error('Failed to create font:', res.error);
            return null;
        }
        return res.data;
    }

    async function updateFont(id: number, data: {
        name?: string;
        engineVersion?: string;
    }): Promise<FontRegistry | null> {
        const res = await rest<FontRegistry>(`/api/fonts/${id}`, {
            method: 'PATCH',
            body: data as any,
        });
        if (res.error || !res.data) {
            console.error(`Failed to update font ${id}:`, res.error);
            return null;
        }
        return res.data;
    }

    async function requestUploadInfo(id: number, filename: string): Promise<{
        uploadUrl: string;
        token: string;
        method: string;
        fileKey: string;
        expectedUrl: string;
    } | null> {
        const res = await rest<{
            uploadUrl: string;
            token: string;
            method: string;
            fileKey: string;
            expectedUrl: string;
        }>(`/api/fonts/${id}/upload?filename=${encodeURIComponent(filename)}`, {
            method: 'POST',
        });
        if (res.error || !res.data) {
            console.error(`Failed to request upload info for font ${id}:`, res.error);
            return null;
        }
        return res.data;
    }

    async function submitForReview(id: number, note?: string): Promise<FontRegistry | null> {
        const res = await rest<FontRegistry>(`/api/fonts/${id}/submit`, {
            method: 'POST',
            body: { note } as any,
        });
        if (res.error || !res.data) {
            console.error(`Failed to submit font ${id} for review:`, res.error);
            return null;
        }
        return res.data;
    }

    async function approveFont(id: number, note?: string): Promise<FontRegistry | null> {
        const res = await rest<FontRegistry>(`/api/fonts/${id}/approve`, {
            method: 'POST',
            body: { note } as any,
        });
        if (res.error || !res.data) {
            console.error(`Failed to approve font ${id}:`, res.error);
            return null;
        }
        return res.data;
    }

    async function rejectFont(id: number, note?: string): Promise<FontRegistry | null> {
        const res = await rest<FontRegistry>(`/api/fonts/${id}/reject`, {
            method: 'POST',
            body: { note } as any,
        });
        if (res.error || !res.data) {
            console.error(`Failed to reject font ${id}:`, res.error);
            return null;
        }
        return res.data;
    }

    async function deleteFont(id: number): Promise<boolean> {
        const res = await rest<void>(`/api/fonts/${id}`, {
            method: 'DELETE',
        });
        if (res.error) {
            console.error(`Failed to delete font ${id}:`, res.error);
            return false;
        }
        return true;
    }

    return {
        getFonts,
        getFont,
        createFont,
        updateFont,
        requestUploadInfo,
        submitForReview,
        approveFont,
        rejectFont,
        deleteFont,
    };
}
