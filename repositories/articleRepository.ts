/**
 * Chanomhub SDK - Article Repository
 */

import type { GraphQLFetcher, RestFetcher } from '../client';
import type {
    Article,
    ArticleListItem,
    ArticleListOptions,
    ArticleWithDownloads,
    NewArticleDTO,
    UpdateArticleDTO,
} from '../types/article';
import type { PaginatedResponse } from '../types/common';
import { buildFieldsQuery } from '../utils/fields';

export interface ArticleRepository {
    /** Get list of articles */
    getAll(options?: ArticleListOptions): Promise<ArticleListItem[]>;

    /** Get paginated list of articles with total count */
    getAllPaginated(options?: ArticleListOptions): Promise<PaginatedResponse<ArticleListItem>>;

    /** Get articles by tag */
    getByTag(tag: string, options?: { limit?: number }): Promise<ArticleListItem[]>;

    /** Get articles by platform */
    getByPlatform(platform: string, options?: { limit?: number }): Promise<ArticleListItem[]>;

    /** Get articles by category */
    getByCategory(category: string, options?: { limit?: number }): Promise<ArticleListItem[]>;

    /** Get single article by slug */
    getBySlug(slug: string, language?: string): Promise<Article | null>;

    /** Get article with downloads */
    getWithDownloads(slug: string, language?: string): Promise<ArticleWithDownloads>;

    /** Create a new article */
    create(data: NewArticleDTO): Promise<Article>;

    /** Update an article */
    update(slug: string, data: UpdateArticleDTO): Promise<Article>;

    /** Delete an article */
    delete(slug: string): Promise<void>;
}

/**
 * Creates an article repository with the given GraphQL client
 */
export function createArticleRepository(
    fetcher: GraphQLFetcher,
    rest: RestFetcher,
): ArticleRepository {
    async function create(data: NewArticleDTO): Promise<Article> {
        const res = await rest<{ article: Article }>('/api/articles', {
            method: 'POST',
            body: data as unknown as Record<string, unknown>,
        });

        if (res.error || !res.data) {
            throw new Error(res.error || 'Failed to create article');
        }

        return res.data.article;
    }

    async function update(slug: string, data: UpdateArticleDTO): Promise<Article> {
        const res = await rest<{ article: Article }>(`/api/articles/${slug}`, {
            method: 'PUT',
            body: { article: data } as unknown as Record<string, unknown>,
        });

        if (res.error || !res.data) {
            throw new Error(res.error || 'Failed to update article');
        }

        return res.data.article;
    }

    async function remove(slug: string): Promise<void> {
        const res = await rest<void>(`/api/articles/${slug}`, {
            method: 'DELETE',
        });

        if (res.error) {
            throw new Error(res.error || 'Failed to delete article');
        }
    }

    async function getAll(options: ArticleListOptions = {}): Promise<ArticleListItem[]> {
        const {
            limit = 12,
            offset = 0,
            status = 'PUBLISHED',
            filter = {},
            preset,
            fields,
        } = options;

        // Build filter string
        const filterParts: string[] = [];
        if (filter.tag) filterParts.push(`tag: "${filter.tag}"`);
        if (filter.platform) filterParts.push(`platform: "${filter.platform}"`);
        if (filter.category) filterParts.push(`category: "${filter.category}"`);
        if (filter.author) filterParts.push(`author: "${filter.author}"`);
        if (filter.favorited !== undefined) filterParts.push(`favorited: ${filter.favorited}`);
        if (filter.engine) filterParts.push(`engine: "${filter.engine}"`);
        if (filter.sequentialCode) filterParts.push(`sequentialCode: "${filter.sequentialCode}"`);
        if (filter.q) filterParts.push(`q: "${filter.q.replace(/"/g, '\\"')}"`);

        const filterArg = filterParts.length > 0 ? `filter: { ${filterParts.join(', ')} }, ` : '';
        const fieldsQuery = buildFieldsQuery({ preset, fields });

        const query = `query GetArticles {
      articles(${filterArg}limit: ${limit}, offset: ${offset}, status: ${status}) {
        ${fieldsQuery}
      }
    }`;

        const { data, errors } = await fetcher<{ articles: ArticleListItem[] }>(
            query,
            {},
            {
                operationName: 'GetArticles',
            },
        );

        if (errors || !data) {
            console.error('Failed to fetch articles:', errors);
            return [];
        }

        return data.articles || [];
    }

    async function getAllPaginated(
        options: ArticleListOptions = {},
    ): Promise<PaginatedResponse<ArticleListItem>> {
        const {
            limit = 12,
            offset = 0,
            status = 'PUBLISHED',
            filter = {},
            preset,
            fields,
        } = options;

        // Build filter string
        const filterParts: string[] = [];
        if (filter.tag) filterParts.push(`tag: "${filter.tag}"`);
        if (filter.platform) filterParts.push(`platform: "${filter.platform}"`);
        if (filter.category) filterParts.push(`category: "${filter.category}"`);
        if (filter.author) filterParts.push(`author: "${filter.author}"`);
        if (filter.favorited !== undefined) filterParts.push(`favorited: ${filter.favorited}`);
        if (filter.engine) filterParts.push(`engine: "${filter.engine}"`);
        if (filter.sequentialCode) filterParts.push(`sequentialCode: "${filter.sequentialCode}"`);
        if (filter.q) filterParts.push(`q: "${filter.q.replace(/"/g, '\\"')}"`);

        const filterArg = filterParts.length > 0 ? `filter: { ${filterParts.join(', ')} }, ` : '';
        const countFilterArg =
            filterParts.length > 0 ? `(filter: { ${filterParts.join(', ')} })` : '';
        const fieldsQuery = buildFieldsQuery({ preset, fields });

        // Query articles and count in a single request
        const query = `query GetArticlesPaginated {
      articles(${filterArg}limit: ${limit}, offset: ${offset}, status: ${status}) {
        ${fieldsQuery}
      }
      articlesCount${countFilterArg}
    }`;

        const { data, errors } = await fetcher<{
            articles: ArticleListItem[];
            articlesCount: number;
        }>(
            query,
            {},
            {
                operationName: 'GetArticlesPaginated',
            },
        );

        if (errors || !data) {
            console.error('Failed to fetch paginated articles:', errors);
            return { items: [], total: 0, page: 1, pageSize: limit };
        }

        const page = Math.floor(offset / limit) + 1;

        return {
            items: data.articles || [],
            total: data.articlesCount || 0,
            page,
            pageSize: limit,
        };
    }

    async function getByTag(
        tag: string,
        options: { limit?: number } = {},
    ): Promise<ArticleListItem[]> {
        const { limit = 50 } = options;

        const query = `query GetArticlesByTag($tag: String!) {
      articles(filter: { tag: $tag }, status: PUBLISHED, limit: ${limit}) {
        ${buildFieldsQuery()}
      }
    }`;

        const { data, errors } = await fetcher<{ articles: ArticleListItem[] }>(
            query,
            { tag },
            {
                operationName: 'GetArticlesByTag',
            },
        );

        if (errors || !data) {
            console.error('Failed to fetch articles by tag:', errors);
            return [];
        }

        return data.articles || [];
    }

    async function getByPlatform(
        platform: string,
        options: { limit?: number } = {},
    ): Promise<ArticleListItem[]> {
        const { limit = 50 } = options;

        const query = `query GetArticlesByPlatform($platform: String!) {
      articles(filter: { platform: $platform }, status: PUBLISHED, limit: ${limit}) {
        ${buildFieldsQuery()}
      }
    }`;

        const { data, errors } = await fetcher<{ articles: ArticleListItem[] }>(
            query,
            { platform },
            {
                operationName: 'GetArticlesByPlatform',
            },
        );

        if (errors || !data) {
            console.error('Failed to fetch articles by platform:', errors);
            return [];
        }

        return data.articles || [];
    }

    async function getByCategory(
        category: string,
        options: { limit?: number } = {},
    ): Promise<ArticleListItem[]> {
        const { limit = 50 } = options;

        const query = `query GetArticlesByCategory($category: String!) {
      articles(filter: { category: $category }, status: PUBLISHED, limit: ${limit}) {
        ${buildFieldsQuery()}
      }
    }`;

        const { data, errors } = await fetcher<{ articles: ArticleListItem[] }>(
            query,
            { category },
            {
                operationName: 'GetArticlesByCategory',
            },
        );

        if (errors || !data) {
            console.error('Failed to fetch articles by category:', errors);
            return [];
        }

        return data.articles || [];
    }

    async function getBySlug(slug: string, language?: string): Promise<Article | null> {
        const query = `query GetArticleBySlug($slug: String!, $language: String) {
      article(slug: $slug, language: $language) {
        ${buildFieldsQuery({ preset: 'full' })}
      }
    }`;

        const { data, errors } = await fetcher<{ article: Article }>(
            query,
            { slug, language },
            {
                operationName: 'GetArticleBySlug',
            },
        );

        if (errors || !data) {
            console.error('Failed to fetch article by slug:', errors);
            return null;
        }

        return data.article || null;
    }

    async function getWithDownloads(
        slug: string,
        language?: string,
    ): Promise<ArticleWithDownloads> {
        const query = `query GetArticleWithDownloads($slug: String!, $language: String, $downloadsArticleId: Int!) {
      article(slug: $slug, language: $language) {
        ${buildFieldsQuery({ preset: 'full' })}
      }
      downloads(articleId: $downloadsArticleId) {
        id
        name
        url
        isActive
        vipOnly
      }
      officialDownloadSources(articleId: $downloadsArticleId) {
        id
        name
        url
        status
      }
    }`;

        // First get article to get its ID
        const articleResult = await getBySlug(slug, language);
        if (!articleResult) {
            return { article: null, downloads: null };
        }

        const { data, errors } = await fetcher<{
            article: Article;
            downloads: Article['downloads'];
            officialDownloadSources: Article['officialDownloadSources'];
        }>(
            query,
            { slug, language, downloadsArticleId: Number(articleResult.id) },
            { operationName: 'GetArticleWithDownloads' },
        );

        if (errors || !data) {
            console.error('Failed to fetch article with downloads:', errors);
            return { article: articleResult, downloads: null };
        }

        // Combine data
        if (data.article) {
            data.article.downloads = data.downloads || [];
            data.article.officialDownloadSources = data.officialDownloadSources || [];
        }

        return {
            article: data.article || articleResult,
            downloads: data.downloads || null,
        };
    }

    return {
        getAll,
        getAllPaginated,
        getByTag,
        getByPlatform,
        getByCategory,
        getBySlug,
        getWithDownloads,
        create,
        update,
        delete: remove,
    };
}
