/**
 * Chanomhub SDK Configuration
 */

export interface ChanomhubConfig {
    /** API base URL */
    apiUrl: string;
    /** CDN base URL for images */
    cdnUrl: string;
    /** Original storage base URL (fallback) */
    storageUrl?: string;
    /** Authentication token (optional) */
    token?: string;
    /** Default cache duration in seconds (0 = no cache) */
    defaultCacheSeconds?: number;
    /** Supabase project URL (required for OAuth) */
    supabaseUrl?: string;
    /** Supabase anon key (required for OAuth) */
    supabaseAnonKey?: string;
}

export const DEFAULT_CONFIG: ChanomhubConfig = {
    apiUrl: 'https://api.chanomhub.com',
    cdnUrl: 'https://cdn.chanomhub.com/cdn-cgi/image/format=auto',
    storageUrl: 'https://cdn.chanomhub.com', // Fallback to raw CDN URL
    defaultCacheSeconds: 3600,
};

/** Article status enum */
export type ArticleStatus =
    | 'DRAFT'
    | 'PENDING_REVIEW'
    | 'PUBLISHED'
    | 'ARCHIVED'
    | 'NOT_APPROVED'
    | 'NEEDS_REVISION';

/** Game engine enum */
export type GameEngine =
    | 'RENPY'
    | 'RPGM'
    | 'UNITY'
    | 'UNREAL'
    | 'GODOT'
    | 'TyranoBuilder'
    | 'WOLFRPG'
    | 'KIRIKIRI'
    | 'FLASH'
    | 'BakinPlayer';
