/**
 * Chanomhub SDK - Shared Field Query Utilities
 * Used by articleRepository and searchRepository
 */

import type { ArticlePreset, ArticleField, ArticleQueryOptions } from '../types/article';
import type { ModField, ModListOptions } from '../types/common';

/**
 * Field definitions for each preset level
 */
export const FIELD_PRESETS: Record<ArticlePreset, ArticleField[]> = {
  minimal: ['id', 'title', 'slug', 'mainImage'],
  standard: [
    'id',
    'title',
    'slug',
    'description',
    'ver',
    'mainImage',
    'coverImage',
    'author',
    'tags',
    'platforms',
    'categories',
    'creators',
    'engine',
    'favoritesCount',
    'favorited',
    'createdAt',
    'updatedAt',
    'status',
    'sequentialCode',
    'images',
  ],
  full: [
    'id',
    'title',
    'slug',
    'description',
    'body',
    'ver',
    'mainImage',
    'coverImage',
    'backgroundImage',
    'author',
    'tags',
    'platforms',
    'categories',
    'creators',
    'engine',
    'images',
    'favoritesCount',
    'favorited',
    'createdAt',
    'updatedAt',
    'status',
    'sequentialCode',
  ],
};

/**
 * GraphQL field mappings - converts field names to GraphQL query fragments
 */
export const FIELD_MAPPINGS: Record<ArticleField, string> = {
  id: 'id',
  title: 'title',
  slug: 'slug',
  description: 'description',
  body: 'body',
  ver: 'ver',
  mainImage: 'mainImage',
  coverImage: 'coverImage',
  backgroundImage: 'backgroundImage',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  status: 'status',
  sequentialCode: 'sequentialCode',
  favoritesCount: 'favoritesCount',
  favorited: 'favorited',
  engine: `engine {
    id
    name
  }`,
  author: `author {
    id
    name
    image
  }`,
  creators: `creators {
    id
    name
  }`,
  tags: `tags {
    id
    name
  }`,
  platforms: `platforms {
    id
    name
  }`,
  categories: `categories {
    id
    name
  }`,
  images: `images {
    id
    url
  }`,
  mods: `mods {
    id
    name
    version
  }`,
  versions: 'versions',
  downloadLinks: `downloadLinks {
    id
    url
    vipOnly
  }`,
  officialDownloadSources: `officialDownloadSources {
    id
    name
    url
    status
  }`,
  version: 'version',
};

export interface FieldQueryOptions {
  /** Field preset level (default: 'standard') */
  preset?: ArticlePreset;
  /** Custom field selection (overrides preset) */
  fields?: ArticleField[];
}

/**
 * Builds GraphQL fields query from preset or custom fields
 */
export function buildFieldsQuery(options: FieldQueryOptions = {}): string {
  const { preset = 'standard', fields } = options;
  const selectedFields = fields ?? FIELD_PRESETS[preset];

  return selectedFields
    .map((field) => FIELD_MAPPINGS[field])
    .filter(Boolean)
    .join('\n  ');
}

/**
 * GraphQL mod field mappings
 */
export const FIELD_MAPPINGS_MOD: Record<ModField, string> = {
  id: 'id',
  name: 'name',
  description: 'description',
  creditTo: 'creditTo',
  downloadLink: 'downloadLink',
  version: 'version',
  status: 'status',
  categories: `categories {
    id
    name
  }`,
  images: `images {
    id
    url
  }`,
  creator: `creator {
    name
    image
  }`,
};

/**
 * Builds GraphQL mod fields query
 */
export function buildModFieldsQuery(options: ModListOptions = {}): string {
  const { fields } = options;

  // Default fields if none provided (all except creator to be safe, or just all?)
  // User complaint was "always gets creator". So let's default to all, but allow overriding.
  // If fields is undefined, we return default set.
  const defaultFields: ModField[] = [
    'id',
    'name',
    'version',
    'downloadLink',
    'creator' // Default includes creator to match previous behavior unless specified
  ];

  const selectedFields = fields ?? defaultFields;

  return selectedFields
    .map((field) => FIELD_MAPPINGS_MOD[field])
    .filter(Boolean)
    .join('\n  ');
}
