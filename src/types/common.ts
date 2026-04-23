/**
 * Chanomhub SDK - Common Types
 */

/** Pagination options */
export interface ListOptions {
    limit?: number;
    offset?: number;
}

/** Paginated response wrapper */
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
}

/** GraphQL response wrapper */
export interface GraphQLResponse<T> {
    data: T | null;
    errors?: Array<{ message: string; path?: string[] }>;
}

/** Author type */
export interface Author {
    id?: number;
    /** Display name */
    name: string;
    /** Username for profile linking */
    username?: string;
    bio: string | null;
    image: string | null;
    backgroundImage: string | null;
    following?: boolean;
    socialMediaLinks?: Array<{ platform: string; url: string }>;
}

/** Download link type */
export interface Download {
    id: number | string;
    name: string;
    url: string;
    isActive: boolean;
    vipOnly: boolean;
    createdAt?: string;
    /** Type of download determined by the backend */
    type: 'DIRECT_FILE' | 'EXTERNAL_MIRROR' | 'PURCHASE_REDIRECT';
    /** Whether this is a redirect link to purchase the article (pseudo-download) */
    isPurchaseRedirect?: boolean;
    /** Whether this is a direct downloadable file (zip, exe, etc.) */
    isDirectFile?: boolean;
}

/** Official download source */
export interface OfficialDownloadSource {
    id: string;
    name: string;
    url: string;
    status: string;
}

/** Mod type */
export interface Mod {
    id: number;
    name: string;
    description: string;
    creditTo: string;
    downloadLink: string;
    version: string;
    status: string;
    categories: NamedEntity[];
    images: ImageObject[];
    creator: {
        name: string;
        image: string | null;
    };
}
/** Named entity (tag, category, platform, etc.) */
export interface NamedEntity {
    id: number | string;
    name: string;
}

/** Image object */
export interface ImageObject {
    id?: string;
    url: string;
}

/** Mod fields for selection */
export type ModField =
    | 'id'
    | 'name'
    | 'description'
    | 'creditTo'
    | 'downloadLink'
    | 'version'
    | 'status'
    | 'categories'
    | 'images'
    | 'creator';

export interface ModListOptions {
    fields?: ModField[];
}

/** Type of item for purchase/checkout */
export enum ItemType {
    ARTICLE = 'ARTICLE',
    MOD = 'MOD',
}
