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
    id: number;
    name: string;
    url: string;
    isActive: boolean;
    vipOnly: boolean;
    createdAt?: string;
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
    name: string;
    description: string;
    creditTo: string;
    downloadLink: string;
    version: string;
    status: string;
    categories: NamedEntity[];
    images: ImageObject[];
}

/** Named entity (tag, category, platform, etc.) */
export interface NamedEntity {
    id: string; // Changed to string as ID is usually string in GraphQL
    name: string;
}

/** Image object */
export interface ImageObject {
    id?: string;
    url: string;
}
