/**
 * Chanomhub SDK - Article Types
 */

import type { ArticleStatus } from '../config';
import type {
    Author,
    Download,
    OfficialDownloadSource,
    Mod,
    NamedEntity,
    ImageObject,
} from './common';

/**
 * Field preset levels for article queries
 * - minimal: Basic info only (id, title, slug, mainImage) - best for cards/thumbnails
 * - standard: Common fields for list views (default)
 * - full: All available fields including body content
 */
export type ArticlePreset = 'minimal' | 'standard' | 'full';

/**
 * Available fields for custom selection
 */
export type ArticleField =
    | 'id'
    | 'title'
    | 'slug'
    | 'description'
    | 'body'
    | 'ver'
    | 'mainImage'
    | 'coverImage'
    | 'backgroundImage'
    | 'author'
    | 'tags'
    | 'platforms'
    | 'categories'
    | 'creators'
    | 'engine'
    | 'images'
    | 'mods'
    | 'favoritesCount'
    | 'favorited'
    | 'createdAt'
    | 'updatedAt'
    | 'status'
    | 'sequentialCode'
    | 'versions'
    | 'downloadLinks'
    | 'officialDownloadSources'
    | 'version';

/** Full Article type */
export interface Article {
    id: number;
    title: string;
    slug: string;
    description: string;
    body: string;
    ver: string | null;
    creators: NamedEntity[];
    tags: NamedEntity[];
    platforms: NamedEntity[];
    categories: NamedEntity[];
    createdAt: string;
    updatedAt: string;
    status: ArticleStatus;
    engine: { id: string; name: string };
    mainImage: string | null;
    backgroundImage: string | null;
    coverImage: string | null;
    images: ImageObject[];
    author: Author;
    favorited: boolean;
    favoritesCount: number;
    sequentialCode: string | null;
    downloads?: Download[];
    mods: Mod[];
    versions?: string[];
    downloadLinks?: Download[];
    officialDownloadSources?: OfficialDownloadSource[];
    version?: string;
}

/** Partial article for list views */
export interface ArticleListItem {
    id: number;
    title: string;
    slug: string;
    description: string;
    ver: string | null;
    createdAt: string;
    updatedAt: string;
    mainImage: string | null;
    coverImage?: string | null;
    favoritesCount: number;
    favorited?: boolean;
    status?: ArticleStatus;
    engine?: { id: string; name: string };
    sequentialCode: string | null;
    author: {
        name: string;
        image: string | null;
    };
    tags?: NamedEntity[];
    platforms?: NamedEntity[];
    categories?: NamedEntity[];
    creators?: NamedEntity[];
    images?: ImageObject[];
}

/** Article filter options */
export interface ArticleFilter {
    tag?: string;
    platform?: string;
    category?: string;
    author?: string;
    favorited?: boolean;
    /** Filter by engine (e.g., 'RenPy', 'Unity') */
    engine?: string;
    /** Filter by sequential code (e.g., 'HJ218') */
    sequentialCode?: string;
    /** Full-text search query */
    q?: string;
}

/** Article list options */
export interface ArticleListOptions {
    limit?: number;
    offset?: number;
    status?: ArticleStatus;
    filter?: ArticleFilter;
    /** Field preset level (default: 'standard') */
    preset?: ArticlePreset;
    /** Custom field selection (overrides preset) */
    fields?: ArticleField[];
}


/** DTO for creating a new article */
export interface NewArticleDTO {
    title: string;
    slug: string;
    description: string;
    body: string;
    language: string;
    /** Game version */
    ver?: string;
    status?: ArticleStatus;
    /** Engine ID or name */
    engine?: string;
    mainImage?: string | null;
    backgroundImage?: string | null;
    coverImage?: string | null;
    otherImages?: string[];
    tags?: string[];
    categories?: string[];
    platforms?: string[];
    creator?: string | null;
}

/** DTO for updating an article */
export interface UpdateArticleDTO {
    title?: string;
    slug?: string;
    description?: string;
    body?: string;
    ver?: string;
    status?: ArticleStatus;
    engine?: string;
    mainImage?: string | null;
    backgroundImage?: string | null;
    coverImage?: string | null;
    otherImages?: string[];
    tags?: string[];
    categories?: string[];
    platforms?: string[];
    creator?: string | null;
}

/** Article with downloads response */
export interface ArticleWithDownloads {
    article: Article | null;
    downloads: Download[] | null;
}

/** Diff statistics */
export interface DiffStats {
    additions: number;
    deletions: number;
}

/** Revision author */
export interface RevisionAuthor {
    id: number;
    name: string;
}

/** Revision summary */
export interface Revision {
    version: number;
    author: RevisionAuthor;
    message?: string;
    createdAt: string;
    stats: DiffStats;
    summary: string;
}

/** Diff line for parsed body diff */
export interface DiffLine {
    type: 'add' | 'remove' | 'context';
    content: string;
    lineNumber?: number;
}

/** Detailed revision with diffs */
export interface RevisionDetail extends Revision {
    titleDiff?: string;
    descriptionDiff?: string;
    bodyDiff?: string;
    parsedBodyDiff?: DiffLine[];
}

/** Comparison result between two versions */
export interface CompareResult {
    stats: DiffStats;
    titleDiff?: string;
    descriptionDiff?: string;
    bodyDiff?: string;
    parsedBodyDiff?: DiffLine[];
}

/** Options for single article queries */
export interface ArticleQueryOptions {
    language?: string;
    version?: string;
    /** Field preset level (default: 'full') */
    preset?: ArticlePreset;
    /** Custom field selection (overrides preset) */
    fields?: ArticleField[];
}
