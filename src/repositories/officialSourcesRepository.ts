/**
 * Chanomhub SDK - Official Sources Repository
 *
 * Publisher-provided purchase/download pages for a game article
 * (e.g. Steam, itch.io, DLsite) — the "buy original" links, distinct
 * from user-submitted DownloadLinks.
 */

import type { RestFetcher } from '../client';

export interface OfficialSource {
    id: number;
    articleId: number;
    name: string;
    url: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface OfficialSourcesRepository {
    /**
     * Get approved official (publisher) links for a published article
     * @param articleId - Article ID
     * @returns Array of approved official sources
     */
    getApprovedByArticle(articleId: number): Promise<OfficialSource[]>;
}

/**
 * Creates an official sources repository with the given REST client
 */
export function createOfficialSourcesRepository(rest: RestFetcher): OfficialSourcesRepository {
    async function getApprovedByArticle(articleId: number): Promise<OfficialSource[]> {
        const res = await rest<{ officialDownloadSources: OfficialSource[] }>(
            `/api/official-download-sources/article/${articleId}/approved`,
        );

        if (res.error || !res.data) {
            console.error('Failed to fetch official sources:', res.error);
            return [];
        }

        return res.data.officialDownloadSources ?? [];
    }

    return {
        getApprovedByArticle,
    };
}
