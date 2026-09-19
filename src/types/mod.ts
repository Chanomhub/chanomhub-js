/**
 * Chanomhub SDK - Mod Types
 */

export interface ModCategory {
    id: number | string;
    name: string;
}

export interface ModImage {
    id?: number | string;
    url: string;
    modId?: number;
}

export interface ModArticle {
    id: number;
    title: string;
    slug: string;
    description: string;
    status: string;
}

export interface ModCreator {
    id: number;
    name: string;
    image?: string | null;
}

/** Mod item response matching Backend ModResponseDto */
export interface ModItem {
    id: number;
    articleId: number;
    creatorId: number;
    name: string;
    description?: string;
    creditTo?: string;
    version?: string;
    downloadLink?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
    articleVersion: number;
    createdAt: string | Date;
    updatedAt: string | Date;
    type: 'MOD' | 'TRANSLATION' | 'PATCH' | string;
    categories?: ModCategory[];
    article?: ModArticle;
    creator?: ModCreator;
    images?: ModImage[];
    sha256?: string;
    fileSizeBytes?: number;
    language?: string;
    languages?: string[];
    forVersion?: string;
}

/** DTO for creating a new mod */
export interface CreateModDTO {
    name?: string;
    description?: string;
    version?: string;
    downloadLink: string;
    creditTo?: string;
    type?: 'MOD' | 'TRANSLATION' | 'PATCH' | string;
    language?: string;
    languages?: string[];
    forVersion?: string;
    images?: string[];
    categoryIds?: number[];
    categories?: string[];
    tags?: string[];
    articleId?: number;
    articleVersion?: number;
    price?: number;
    isPremium?: boolean;
}

/** DTO for updating a mod */
export interface UpdateModDTO {
    name?: string;
    description?: string;
    version?: string;
    downloadLink?: string;
    creditTo?: string;
    type?: 'MOD' | 'TRANSLATION' | 'PATCH' | string;
    language?: string;
    languages?: string[];
    forVersion?: string;
    images?: string[];
    categoryIds?: number[];
    categories?: string[];
    price?: number;
    isPremium?: boolean;
    articleId?: number;
    articleVersion?: number;
}

/**
 * Payload for submitting translation packs produced by NST or other tools.
 * Matches Backend NstTranslationSubmissionDto
 */
export interface NstTranslationSubmissionDTO {
    /** Public URL of the uploaded translation archive */
    downloadLink: string;
    /** Language of the translation (e.g. 'Thai', 'th') */
    language: string;
    /** Detected game engine (e.g. 'rpgm', 'renpy', 'unity') */
    engine: string;
    /** Translation pack version */
    version?: string;
    /** Tool name or credit */
    creditTo?: string;
    /** Human readable name */
    name?: string;
    /** Description / notes */
    description?: string;
    /** Engine metadata / config */
    config?: Record<string, unknown>;
    /** File size in bytes */
    fileSizeBytes?: number;
    /** SHA-256 checksum of the archive */
    sha256?: string;
    /** Target game version */
    gameVersion?: string;
    /** AI translator model used */
    translatorModel?: string;
    /** Source language (e.g. 'English', 'Japanese') */
    sourceLanguage?: string;
    /** Target language */
    targetLanguage?: string;
    /** Detailed translation statistics */
    stats?: Record<string, unknown>;
}

/** Options when fetching all mods */
export interface GetAllModsOptions {
    status?: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
    type?: string;
    language?: string;
    articleId?: number;
    articleSlug?: string;
    creatorId?: number;
    search?: string;
    skip?: number;
    take?: number;
}

/** Query options when fetching mods by article slug */
export interface ModQueryOptions {
    status?: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
    type?: string;
    language?: string;
}

/** Response when fetching multiple mods */
export interface ModListResponse {
    mods: ModItem[];
    modsCount: number;
}

/** Options for high-level publishTranslationPack */
export interface PublishTranslationPackOptions extends Omit<NstTranslationSubmissionDTO, 'downloadLink'> {
    /** Filename to use when uploading to storage */
    filename?: string;
}
