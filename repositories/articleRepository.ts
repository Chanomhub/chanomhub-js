/**
 * Chanomhub SDK - Article Repository
 */

import type { GraphQLFetcher, RestFetcher } from '../client';
import type { ChanomhubConfig } from '../config';
import type {
    Article,
    ArticleListItem,
    ArticleListOptions,
    ArticleQueryOptions,
    NewArticleDTO,
    UpdateArticleDTO,
    Revision,
    RevisionDetail,
    CompareResult,
} from '../types/article';
import type {
    Mod,
    ModListOptions,
    PaginatedResponse,
    OfficialDownloadSource,
    NamedEntity,
} from '../types/common';
import { buildFieldsQuery, buildModFieldsQuery } from '../utils/fields';
import { resolveDownloadUrl } from '../transforms/downloadUrl';

export interface ArticleRepository {
    /** Get list of articles */
    getAll(options?: ArticleListOptions): Promise<ArticleListItem[]>;

    /** Get paginated list of articles with total count */
    getAllPaginated(options?: ArticleListOptions): Promise<PaginatedResponse<ArticleListItem>>;

    /** Get articles by tag */
    getByTag(tag: string, options?: ArticleQueryOptions): Promise<ArticleListItem[]>;

    /** Get articles by platform */
    getByPlatform(platform: string, options?: ArticleQueryOptions): Promise<ArticleListItem[]>;

    /** Get articles by category */
    getByCategory(category: string, options?: ArticleQueryOptions): Promise<ArticleListItem[]>;

    /** Get single article by slug */
    getBySlug(slug: string, options?: ArticleQueryOptions): Promise<Article | null>;

    /** Get all available tags */
    getTags(): Promise<string[]>;

    /** Get all available categories */
    getCategories(): Promise<string[]>;

    /** Get all available platforms */
    getPlatforms(): Promise<string[]>;

    /** Get all available engines */
    getEngines(): Promise<NamedEntity[]>;

    /** Create a new article */
    create(data: NewArticleDTO): Promise<Article>;

    /** Update an article */
    update(slug: string, data: UpdateArticleDTO): Promise<Article>;

    /** Delete an article */
    delete(slug: string): Promise<void>;

    /** Get revisions for an article */
    getRevisions(slug: string): Promise<PaginatedResponse<Revision>>;

    /** Get specific revision details */
    getRevision(slug: string, version: number): Promise<RevisionDetail>;

    /** Compare two versions */
    compareVersions(slug: string, v1: number, v2: number): Promise<CompareResult>;

    /** Get article with versions */
    getWithVersions(slug: string): Promise<Article | null>;

    /** Get article by version */
    getByVersion(slug: string, version: string): Promise<Article | null>;

    /** Get mods for an article */
    getMods(articleId: number, options?: ModListOptions): Promise<Mod[]>;

    /** Get official download sources for an article */
    getOfficialDownloadSources(articleId: number): Promise<OfficialDownloadSource[]>;

    /** Restore article to a specific version */
    restoreRevision(slug: string, version: number): Promise<RevisionDetail>;

    /** Purchase a paid article */
    purchase(articleId: number, options?: { successUrl?: string; cancelUrl?: string }): Promise<Article>;

    /** Reserve a slug based on title */
    reserveSlug(title: string): Promise<{ slug: string }>;
}

/**
 * Helper to transform and add metadata to download links
 */
function transformDownload<T extends { url: string }>(
    download: T,
    storageDownloadUrl?: string
): T & { isPurchaseRedirect: boolean, isDirectFile: boolean } {
    const originalUrl = download.url;
    // Resolve relative storage URLs (e.g., "public/abc.zip")
    const resolvedUrl = resolveDownloadUrl(originalUrl, storageDownloadUrl) || originalUrl;

    const url = resolvedUrl.toLowerCase();
    const isPurchaseRedirect =
        url.includes('purchase=true') ||
        url.includes('purchase%3dtrue') ||
        (url.includes('/articles/') && !url.startsWith('http')) ||
        url.includes('imgproxy.chanomhub.com');

    const isDirectFile =
        !isPurchaseRedirect &&
        (url.endsWith('.zip') ||
            url.endsWith('.rar') ||
            url.endsWith('.7z') ||
            url.endsWith('.xz') ||
            url.endsWith('.tar.xz') ||
            url.endsWith('.exe') ||
            url.endsWith('.apk') ||
            url.endsWith('.dmg') ||
            url.includes('/premium/') ||
            url.includes('/public/'));

    return {
        ...download,
        url: resolvedUrl,
        isPurchaseRedirect,
        isDirectFile,
    };
}

/**
 * Creates an article repository with the given GraphQL client
 */
export function createArticleRepository(
    fetcher: GraphQLFetcher,
    rest: RestFetcher,
    config?: ChanomhubConfig,
): ArticleRepository {
    const storageDownloadUrl = config?.storageDownloadUrl;

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

    async function getRevisions(slug: string): Promise<PaginatedResponse<Revision>> {
        const res = await rest<{ revisions: Revision[]; total: number }>(
            `/api/articles/${slug}/revisions`,
        );

        if (res.error || !res.data) {
            throw new Error(res.error || 'Failed to get revisions');
        }

        return {
            items: res.data.revisions,
            total: res.data.total,
            page: 1,
            pageSize: res.data.total,
        };
    }

    async function getRevision(slug: string, version: number): Promise<RevisionDetail> {
        const res = await rest<RevisionDetail>(`/api/articles/${slug}/revisions/${version}`);

        if (res.error || !res.data) {
            throw new Error(res.error || 'Failed to get revision');
        }

        return res.data;
    }

    async function compareVersions(slug: string, v1: number, v2: number): Promise<CompareResult> {
        // Note: query parameters should be handled, but rest client is simple string concatenation for now
        // Assuming rest client doesn't support query params in options yet, appending manually
        const res = await rest<CompareResult>(
            `/api/articles/${slug}/revisions/compare?v1=${v1}&v2=${v2}`,
        );

        if (res.error || !res.data) {
            throw new Error(res.error || 'Failed to compare versions');
        }

        return res.data;
    }

    async function restoreRevision(slug: string, version: number): Promise<RevisionDetail> {
        const res = await rest<RevisionDetail>(
            `/api/articles/${slug}/revisions/${version}/restore`,
            {
                method: 'POST',
                body: { message: `Restored from version ${version}` } as unknown as Record<
                    string,
                    unknown
                >,
            },
        );

        if (res.error || !res.data) {
            throw new Error(res.error || 'Failed to restore revision');
        }

        return res.data;
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
      public {
        articles(${filterArg}limit: ${limit}, offset: ${offset}, status: ${status}) {
          ${fieldsQuery}
        }
      }
    }`;

        const { data, errors } = await fetcher<{ public: { articles: ArticleListItem[] } }>(
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

        return data.public.articles || [];
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
      public {
        articles(${filterArg}limit: ${limit}, offset: ${offset}, status: ${status}) {
          ${fieldsQuery}
        }
        articlesCount${countFilterArg}
      }
    }`;

        const { data, errors } = await fetcher<{
            public: {
                articles: ArticleListItem[];
                articlesCount: number;
            };
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
            items: data.public.articles || [],
            total: data.public.articlesCount || 0,
            page,
            pageSize: limit,
        };
    }

    async function getByTag(
        tag: string,
        options: ArticleQueryOptions = {},
    ): Promise<ArticleListItem[]> {
        const { preset = 'standard', fields, limit = 50, offset = 0 } = options;

        const query = `query GetArticlesByTag($tag: String!) {
      public {
        articles(filter: { tag: $tag }, status: PUBLISHED, limit: ${limit}, offset: ${offset}) {
          ${buildFieldsQuery({ preset, fields })}
        }
      }
    }`;

        const { data, errors } = await fetcher<{ public: { articles: ArticleListItem[] } }>(
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

        return data.public.articles || [];
    }

    async function getByPlatform(
        platform: string,
        options: ArticleQueryOptions = {},
    ): Promise<ArticleListItem[]> {
        const { preset = 'standard', fields, limit = 50, offset = 0 } = options;

        const query = `query GetArticlesByPlatform($platform: String!) {
      public {
        articles(filter: { platform: $platform }, status: PUBLISHED, limit: ${limit}, offset: ${offset}) {
          ${buildFieldsQuery({ preset, fields })}
        }
      }
    }`;

        const { data, errors } = await fetcher<{ public: { articles: ArticleListItem[] } }>(
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

        return data.public.articles || [];
    }

    async function getByCategory(
        category: string,
        options: ArticleQueryOptions = {},
    ): Promise<ArticleListItem[]> {
        const { preset = 'standard', fields, limit = 50, offset = 0 } = options;

        const query = `query GetArticlesByCategory($category: String!) {
      public {
        articles(filter: { category: $category }, status: PUBLISHED, limit: ${limit}, offset: ${offset}) {
          ${buildFieldsQuery({ preset, fields })}
        }
      }
    }`;

        const { data, errors } = await fetcher<{ public: { articles: ArticleListItem[] } }>(
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

        return data.public.articles || [];
    }

    async function getBySlug(
        slug: string,
        options: ArticleQueryOptions = {},
    ): Promise<Article | null> {
        const { language, version, preset = 'full', fields } = options;
        const query = `query GetArticleBySlug($slug: String!, $language: String, $version: String) {
      public {
        article(slug: $slug, language: $language, version: $version) {
          ${buildFieldsQuery({ preset, fields })}
        }
      }
    }`;

        const { data, errors } = await fetcher<{ public: { article: Article } }>(
            query,
            { slug, language, version },
            {
                operationName: 'GetArticleBySlug',
            },
        );

        if (errors || !data) {
            console.error('Failed to fetch article by slug:', errors);
            return null;
        }

        const article = data.public.article;
        if (article && article.downloads) {
            article.downloads = article.downloads.map((d) =>
                transformDownload(d, storageDownloadUrl),
            );
        }

        return article || null;
    }

    async function getWithVersions(slug: string): Promise<Article | null> {
        return getBySlug(slug, { fields: ['id', 'title', 'slug', 'versions'] });
    }

    async function getByVersion(slug: string, version: string): Promise<Article | null> {
        return getBySlug(slug, {
            version,
            fields: ['id', 'title', 'downloads', 'mods'],
        });
    }

    async function getMods(articleId: number, options: ModListOptions = {}): Promise<Mod[]> {
        const query = `query GetArticleMods($articleId: Int!) {
      public {
        article(id: $articleId) {
          mods {
            ${buildModFieldsQuery(options)}
          }
        }
      }
    }`;

        const { data, errors } = await fetcher<{ public: { article: { mods: Mod[] } } }>(
            query,
            { articleId },
            { operationName: 'GetArticleMods' },
        );

        if (errors || !data) {
            console.error('Failed to fetch article mods:', errors);
            return [];
        }

        return data.public.article?.mods || [];
    }

    async function getOfficialDownloadSources(
        articleId: number,
    ): Promise<OfficialDownloadSource[]> {
        const query = `query GetOfficialDownloadSources($articleId: Int!) {
      public {
        article(id: $articleId) {
          officialDownloadSources {
            id
            name
            url
            status
          }
        }
      }
    }`;

        const { data, errors } = await fetcher<{
            public: { article: { officialDownloadSources: OfficialDownloadSource[] } };
        }>(query, { articleId }, { operationName: 'GetOfficialDownloadSources' });

        if (errors || !data) {
            console.error('Failed to fetch official download sources:', errors);
            return [];
        }

        return data.public.article?.officialDownloadSources || [];
    }

    async function getTags(): Promise<string[]> {
        const query = `query GetTags {
      system {
        tags
      }
    }`;

        const { data, errors } = await fetcher<{ system: { tags: string[] } }>(
            query,
            {},
            { operationName: 'GetTags' },
        );

        if (errors || !data) {
            console.error('Failed to fetch tags:', errors);
            return [];
        }

        return data.system.tags || [];
    }

    async function getCategories(): Promise<string[]> {
        const query = `query GetCategories {
      system {
        categories
      }
    }`;

        const { data, errors } = await fetcher<{ system: { categories: string[] } }>(
            query,
            {},
            { operationName: 'GetCategories' },
        );

        if (errors || !data) {
            console.error('Failed to fetch categories:', errors);
            return [];
        }

        return data.system.categories || [];
    }

    async function getPlatforms(): Promise<string[]> {
        const query = `query GetPlatforms {
      system {
        platforms
      }
    }`;

        const { data, errors } = await fetcher<{ system: { platforms: string[] } }>(
            query,
            {},
            { operationName: 'GetPlatforms' },
        );

        if (errors || !data) {
            console.error('Failed to fetch platforms:', errors);
            return [];
        }

        return data.system.platforms || [];
    }

    async function getEngines(): Promise<NamedEntity[]> {
        const res = await rest<NamedEntity[]>('/api/engines');

        if (res.error || !res.data) {
            console.error('Failed to fetch engines:', res.error);
            return [];
        }

        return res.data;
    }

    async function purchase(
        id: number,
        options: { successUrl?: string; cancelUrl?: string } = {},
    ): Promise<Article> {
        const res = await rest<{ article: Article }>(`/api/v1/lago/purchase/article/${id}`, {
            method: 'POST',
            body: options as unknown as Record<string, unknown>,
        });

        if (res.error || !res.data) {
            throw new Error(res.error || 'Failed to purchase article');
        }

        return res.data.article;
    }

    async function reserveSlug(title: string): Promise<{ slug: string }> {
        const res = await rest<{ slug: string }>('/api/articles/reserve', {
            method: 'POST',
            body: { title },
        });

        if (res.error || !res.data) {
            throw new Error(res.error || 'Failed to reserve slug');
        }

        return res.data;
    }

    return {
        getAll,
        getAllPaginated,
        getByTag,
        getByPlatform,
        getByCategory,
        getBySlug,

        getWithVersions,
        getByVersion,
        getMods,
        getOfficialDownloadSources,
        getTags,
        getCategories,
        getPlatforms,
        getEngines,
        create,
        update,
        delete: remove,
        getRevisions,
        getRevision,
        compareVersions,
        restoreRevision,
        purchase,
        reserveSlug,
    };
}
