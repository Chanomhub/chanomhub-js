/**
 * Chanomhub SDK - Sponsored Articles Repository
 */

import type { GraphQLFetcher, RestFetcher } from '../client';
import type { ChanomhubConfig } from '../config';
import type {
    SponsoredArticle,
    CreateSponsoredArticleDTO,
    UpdateSponsoredArticleDTO,
} from '../types/sponsoredArticle';
import { AuthenticationError } from '../errors';
import { buildFieldsQuery } from '../utils/fields';

export interface SponsoredArticlesRepository {
    /**
     * Get all active sponsored articles (public)
     * Uses GraphQL v2 to fetch nested article data in a single query
     */
    getAll(): Promise<SponsoredArticle[]>;

    /**
     * Get a sponsored article by ID (public)
     * @param id - Sponsored article ID
     */
    getById(id: number): Promise<SponsoredArticle | null>;

    /**
     * Create a new sponsored article (admin only)
     * @param data - Create DTO
     */
    create(data: CreateSponsoredArticleDTO): Promise<SponsoredArticle>;

    /**
     * Update a sponsored article (admin only)
     * @param id - Sponsored article ID
     * @param data - Update DTO
     */
    update(id: number, data: UpdateSponsoredArticleDTO): Promise<SponsoredArticle>;

    /**
     * Delete a sponsored article (admin only)
     * @param id - Sponsored article ID
     */
    delete(id: number): Promise<void>;
}

/**
 * Creates a sponsored articles repository
 */
export function createSponsoredArticlesRepository(
    fetcher: GraphQLFetcher,
    rest: RestFetcher,
    config: ChanomhubConfig,
): SponsoredArticlesRepository {
    function requireAuth(): void {
        if (!config.token) {
            throw new AuthenticationError(
                'Authentication required for sponsored articles management. Use createAuthenticatedClient() or provide a token.',
            );
        }
    }

    async function getAll(): Promise<SponsoredArticle[]> {
        const articleFields = buildFieldsQuery({ preset: 'standard' });

        const query = `query GetSponsoredArticles {
      public {
        sponsoredArticles {
          id
          articleId
          coverImage
          isActive
          priority
          startDate
          endDate
          article {
            ${articleFields}
          }
        }
      }
    }`;

        const { data, errors } = await fetcher<{
            public: { sponsoredArticles: SponsoredArticle[] };
        }>(query, {}, { operationName: 'GetSponsoredArticles' });

        if (errors || !data) {
            console.error('Failed to fetch sponsored articles:', errors);
            return [];
        }

        return data.public.sponsoredArticles || [];
    }

    async function getById(id: number): Promise<SponsoredArticle | null> {
        const { data, error } = await rest<SponsoredArticle>(`/api/sponsored-articles/${id}`);

        if (error || !data) {
            if (error?.includes('404')) return null;
            console.error('Failed to fetch sponsored article:', error);
            return null;
        }

        return data;
    }

    async function create(dto: CreateSponsoredArticleDTO): Promise<SponsoredArticle> {
        requireAuth();

        const { data, error } = await rest<SponsoredArticle>('/api/sponsored-articles', {
            method: 'POST',
            body: dto as unknown as Record<string, unknown>,
        });

        if (error || !data) {
            throw new Error(error || 'Failed to create sponsored article');
        }

        return data;
    }

    async function update(id: number, dto: UpdateSponsoredArticleDTO): Promise<SponsoredArticle> {
        requireAuth();

        const { data, error } = await rest<SponsoredArticle>(`/api/sponsored-articles/${id}`, {
            method: 'PUT',
            body: dto as unknown as Record<string, unknown>,
        });

        if (error || !data) {
            throw new Error(error || 'Failed to update sponsored article');
        }

        return data;
    }

    async function remove(id: number): Promise<void> {
        requireAuth();

        const { error } = await rest<void>(`/api/sponsored-articles/${id}`, { method: 'DELETE' });

        if (error) {
            throw new Error(error || 'Failed to delete sponsored article');
        }
    }

    return {
        getAll,
        getById,
        create,
        update,
        delete: remove,
    };
}
