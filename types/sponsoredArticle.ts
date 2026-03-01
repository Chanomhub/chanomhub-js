/**
 * Chanomhub SDK - Sponsored Article Types
 */

import type { ArticleListItem } from './article';

/** Sponsored Article — links to an Article with promotion metadata */
export interface SponsoredArticle {
    id: number;
    articleId: number;
    /** Cover image override (null = fallback to article.coverImage → article.mainImage) */
    coverImage: string | null;
    isActive: boolean;
    priority: number;
    startDate: string;
    endDate: string | null;
    /** Nested article data */
    article: ArticleListItem;
}

/** DTO for creating a sponsored article (admin only) */
export interface CreateSponsoredArticleDTO {
    articleId: number;
    coverImage?: string | null;
    isActive?: boolean;
    priority?: number;
    startDate?: string;
    endDate?: string | null;
}

/** DTO for updating a sponsored article (admin only) */
export interface UpdateSponsoredArticleDTO {
    coverImage?: string | null;
    isActive?: boolean;
    priority?: number;
    startDate?: string;
    endDate?: string | null;
}
