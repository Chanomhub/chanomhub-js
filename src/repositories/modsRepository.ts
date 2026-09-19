/**
 * Chanomhub SDK - Mods Repository
 */

import type { RestFetcher } from '../client';
import type { ChanomhubConfig } from '../config';
import type {
    ModItem,
    CreateModDTO,
    UpdateModDTO,
    NstTranslationSubmissionDTO,
    GetAllModsOptions,
    ModQueryOptions,
    ModListResponse,
    PublishTranslationPackOptions,
} from '../types/mod';
import { AuthenticationError } from '../errors';

export interface ModsRepository {
    /**
     * Get all mods for a specific article by slug
     * @param slug - Article slug
     * @param options - Optional status filter
     */
    getByArticle(slug: string, options?: ModQueryOptions): Promise<ModItem[]>;

    /**
     * Get all mods with pagination and status filters
     * @param options - Pagination and status options
     */
    getAll(options?: GetAllModsOptions): Promise<ModListResponse>;

    /**
     * Get a mod by ID
     * @param id - Mod ID
     */
    getById(id: number): Promise<ModItem>;

    /**
     * Create a new mod for an article
     * @param slug - Article slug
     * @param data - Mod data
     * @returns Created mod
     */
    create(slug: string, data: CreateModDTO): Promise<ModItem>;

    /**
     * Submit a translation pack produced by NST or translation tools
     * Creates a TRANSLATION mod with PENDING status for moderation
     * @param slug - Article slug
     * @param data - NST submission payload
     */
    submitNstTranslation(slug: string, data: NstTranslationSubmissionDTO): Promise<ModItem>;

    /**
     * Update an existing mod (creator or admin/moderator only)
     * @param id - Mod ID
     * @param data - Mod update payload
     */
    update(id: number, data: UpdateModDTO): Promise<ModItem>;

    /**
     * Update mod status (admin/moderator only)
     * @param id - Mod ID
     * @param status - PENDING | APPROVED | REJECTED
     */
    updateStatus(id: number, status: 'PENDING' | 'APPROVED' | 'REJECTED' | string): Promise<ModItem>;

    /**
     * Delete a mod (creator or admin/moderator only)
     * @param id - Mod ID
     */
    delete(id: number): Promise<void>;

    /**
     * Upload an archive and submit it as an NST translation in a single step
     * Handles file upload to storage and submission to the backend
     * @param slug - Article slug
     * @param file - File data (File, Blob, or Uint8Array/ArrayBuffer)
     * @param options - Submission metadata
     */
    publishTranslationPack(
        slug: string,
        file: File | Blob | Uint8Array | ArrayBuffer,
        options: PublishTranslationPackOptions,
    ): Promise<ModItem>;
}

/**
 * Creates a mods repository with the given REST client
 */
export function createModsRepository(
    fetcher: RestFetcher,
    config: ChanomhubConfig,
): ModsRepository {
    function requireAuth(): void {
        if (!config.token) {
            throw new AuthenticationError(
                'Authentication required for mod management. Use createAuthenticatedClient() or provide a token.',
            );
        }
    }

    async function getByArticle(slug: string, options: ModQueryOptions = {}): Promise<ModItem[]> {
        const queryParams = new URLSearchParams();
        if (options.status) queryParams.set('status', options.status);
        if (options.type) queryParams.set('type', options.type);
        if (options.language) queryParams.set('language', options.language);
        const qs = queryParams.toString();
        const endpoint = `/api/mods/article/${encodeURIComponent(slug)}${qs ? `?${qs}` : ''}`;

        const { data, error } = await fetcher<{ mods: ModItem[]; modsCount: number }>(endpoint);
        if (error || !data) {
            throw new Error(error || `Failed to fetch mods for article '${slug}'`);
        }
        return data.mods || [];
    }

    async function getAll(options: GetAllModsOptions = {}): Promise<ModListResponse> {
        const queryParams = new URLSearchParams();
        if (options.status) queryParams.set('status', options.status);
        if (options.type) queryParams.set('type', options.type);
        if (options.language) queryParams.set('language', options.language);
        if (options.search) queryParams.set('search', options.search);
        if (options.articleId !== undefined) queryParams.set('articleId', String(options.articleId));
        if (options.articleSlug) queryParams.set('articleSlug', options.articleSlug);
        if (options.creatorId !== undefined) queryParams.set('creatorId', String(options.creatorId));
        if (options.skip !== undefined) queryParams.set('skip', String(options.skip));
        if (options.take !== undefined) queryParams.set('take', String(options.take));
        const qs = queryParams.toString();
        const endpoint = `/api/mods${qs ? `?${qs}` : ''}`;

        const { data, error } = await fetcher<{ mods: ModItem[]; modsCount: number }>(endpoint);
        if (error || !data) {
            throw new Error(error || 'Failed to fetch mods');
        }
        return {
            mods: data.mods || [],
            modsCount: data.modsCount || 0,
        };
    }

    async function getById(id: number): Promise<ModItem> {
        const { data, error } = await fetcher<{ mod: ModItem }>(`/api/mods/${id}`);
        if (error || !data) {
            throw new Error(error || `Failed to fetch mod #${id}`);
        }
        return data.mod;
    }

    async function create(slug: string, data: CreateModDTO): Promise<ModItem> {
        requireAuth();

        const { data: response, error } = await fetcher<{ mod: ModItem }>(
            `/api/mods/article/${encodeURIComponent(slug)}`,
            {
                method: 'POST',
                body: data as unknown as Record<string, unknown>,
            },
        );

        if (error || !response) {
            throw new Error(error || 'Failed to create mod');
        }

        return response.mod;
    }

    async function submitNstTranslation(
        slug: string,
        data: NstTranslationSubmissionDTO,
    ): Promise<ModItem> {
        requireAuth();

        const { data: response, error } = await fetcher<{ mod: ModItem }>(
            `/api/mods/article/${encodeURIComponent(slug)}/nst-submission`,
            {
                method: 'POST',
                body: data as unknown as Record<string, unknown>,
            },
        );

        if (error || !response) {
            throw new Error(error || 'Failed to submit translation mod');
        }

        return response.mod;
    }

    async function update(id: number, data: UpdateModDTO): Promise<ModItem> {
        requireAuth();

        const { data: response, error } = await fetcher<{ mod: ModItem }>(`/api/mods/${id}`, {
            method: 'PATCH',
            body: data as unknown as Record<string, unknown>,
        });

        if (error || !response) {
            throw new Error(error || `Failed to update mod #${id}`);
        }

        return response.mod;
    }

    async function updateStatus(
        id: number,
        status: 'PENDING' | 'APPROVED' | 'REJECTED' | string,
    ): Promise<ModItem> {
        requireAuth();

        const { data: response, error } = await fetcher<{ mod: ModItem }>(`/api/mods/${id}/status`, {
            method: 'PATCH',
            body: { status },
        });

        if (error || !response) {
            throw new Error(error || `Failed to update status for mod #${id}`);
        }

        return response.mod;
    }

    async function remove(id: number): Promise<void> {
        requireAuth();

        const { error } = await fetcher<void>(`/api/mods/${id}`, {
            method: 'DELETE',
        });

        if (error) {
            throw new Error(error || `Failed to delete mod #${id}`);
        }
    }

    async function computeSha256(buffer: ArrayBuffer): Promise<string> {
        if (typeof crypto !== 'undefined' && crypto?.subtle?.digest) {
            const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
        }
        return '';
    }

    async function publishTranslationPack(
        slug: string,
        file: File | Blob | Uint8Array | ArrayBuffer,
        options: PublishTranslationPackOptions,
    ): Promise<ModItem> {
        requireAuth();

        let arrayBuffer: ArrayBuffer;
        let blob: Blob;
        let size: number;
        let filename = options.filename || 'translation_pack.zip';

        if (typeof File !== 'undefined' && file instanceof File) {
            arrayBuffer = await file.arrayBuffer();
            blob = file;
            size = file.size;
            if (!options.filename) filename = file.name;
        } else if (typeof Blob !== 'undefined' && file instanceof Blob) {
            arrayBuffer = await file.arrayBuffer();
            blob = file;
            size = file.size;
        } else if (file instanceof ArrayBuffer) {
            arrayBuffer = file;
            blob = new Blob([file]);
            size = file.byteLength;
        } else if (file instanceof Uint8Array) {
            const copy = new Uint8Array(file.byteLength);
            copy.set(file);
            arrayBuffer = copy.buffer as ArrayBuffer;
            blob = new Blob([arrayBuffer]);
            size = copy.byteLength;
        } else {
            throw new Error('Unsupported file type for translation pack');
        }

        const sha256 = options.sha256 || (await computeSha256(arrayBuffer));
        const fileSizeBytes = options.fileSizeBytes || size;

        // Upload to storage service (GOR2 storage)
        const storageUrl = config.storageServiceUrl || 'https://oi.chanomhub.com';
        const formData = new FormData();
        formData.append('file', blob, filename);

        const uploadUrl = new URL(`${storageUrl}/upload`);
        uploadUrl.searchParams.append('bucket', 'storage');
        uploadUrl.searchParams.append('game', slug);

        const uploadResponse = await fetch(uploadUrl.toString(), {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${config.token}`,
            },
            body: formData,
        });

        if (!uploadResponse.ok) {
            const errData = await uploadResponse.json().catch(() => ({}));
            throw new Error(
                errData.error || errData.message || `Upload failed with status ${uploadResponse.status}`,
            );
        }

        const uploadResult = await uploadResponse.json();
        const downloadLink =
            uploadResult.full_url ||
            uploadResult.url ||
            `${storageUrl}/${String(uploadResult.filename || uploadResult.key || filename).replace(/^\//, '')}`;

        // Submit NST translation pack
        const submissionPayload: NstTranslationSubmissionDTO = {
            ...options,
            downloadLink,
            sha256,
            fileSizeBytes,
        };

        return await submitNstTranslation(slug, submissionPayload);
    }

    return {
        getByArticle,
        getAll,
        getById,
        create,
        submitNstTranslation,
        update,
        updateStatus,
        delete: remove,
        publishTranslationPack,
    };
}
