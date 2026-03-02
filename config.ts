/**
 * Chanomhub SDK Configuration
 */

/** Imgproxy resize type */
export type ImgproxyResizeType = 'fit' | 'fill' | 'fill-down' | 'force' | 'auto';

/** Imgproxy gravity (for cropping) */
export type ImgproxyGravity =
    | 'no'
    | 'so'
    | 'ea'
    | 'we'
    | 'noea'
    | 'nowe'
    | 'soea'
    | 'sowe'
    | 'ce'
    | 'sm'
    | 'fp';

/** Imgproxy output format */
export type ImgproxyFormat =
    | 'webp'
    | 'avif'
    | 'jpg'
    | 'png'
    | 'gif'
    | 'ico'
    | 'heic'
    | 'bmp'
    | 'tiff';

/**
 * Imgproxy processing options
 * @see https://docs.imgproxy.net/usage/processing
 */
export interface ImgproxyOptions {
    /** Output format (default: 'webp') */
    format?: ImgproxyFormat;
    /** Resize type (default: 'fit') */
    resizeType?: ImgproxyResizeType;
    /** Target width (0 = auto based on height) */
    width?: number;
    /** Target height (0 = auto based on width) */
    height?: number;
    /** Quality 1-100 (0 = use server default) */
    quality?: number;
    /** Gravity for cropping (default: 'ce' center) */
    gravity?: ImgproxyGravity;
    /** Allow enlarging smaller images */
    enlarge?: boolean;
    /** Device pixel ratio (1-8) */
    dpr?: number;
    /** Blur radius (0 = no blur) */
    blur?: number;
    /** Sharpen sigma (0 = no sharpen) */
    sharpen?: number;
}

export interface ChanomhubConfig {
    /** API base URL */
    apiUrl: string;
    /** Imgproxy base URL for image processing */
    cdnUrl: string;
    /** Original storage base URL (source images) */
    storageUrl?: string;
    /** Default imgproxy options */
    imgproxyOptions?: ImgproxyOptions;
    /** Authentication token (optional) */
    token?: string;
    /** Default cache duration in seconds (0 = no cache) */
    defaultCacheSeconds?: number;
    /** Supabase project URL (required for OAuth) */
    supabaseUrl?: string;
    /** Supabase anon key (required for OAuth) */
    supabaseAnonKey?: string;
    /** Storage service URL (GOR2) */
    storageServiceUrl?: string;
    /** Download gateway URL (Worker) */
    downloadGatewayUrl?: string;
}

export const DEFAULT_IMGPROXY_OPTIONS: ImgproxyOptions = {
    format: 'webp',
};

export const DEFAULT_CONFIG: ChanomhubConfig = {
    apiUrl: 'https://api.chanomhub.com',
    cdnUrl: 'https://imgproxy.chanomhub.com',
    storageUrl: 'https://cdn.chanomhub.com',
    storageServiceUrl: 'https://oi.chanomhub.com',
    downloadGatewayUrl: 'https://dl.chanomhub.com',
    imgproxyOptions: DEFAULT_IMGPROXY_OPTIONS,
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
