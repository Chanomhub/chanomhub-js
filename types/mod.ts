/**
 * Chanomhub SDK - Mod Types
 */

import type { Mod } from './common';

/** DTO for creating a new mod */
export interface CreateModDTO {
    name: string;
    version: string;
    articleId: number;
    articleVersion: number;
    type: string;
    description: string;
    downloadLink?: string; // Optional if file is uploaded separately but usually required for the API if not handling file upload here
    creditTo?: string;
    categories?: string[];
    tags?: string[];
    images?: any; // To be defined better if we support image upload in SDK
}

/** DTO for updating a mod */
export interface UpdateModDTO {
    name?: string;
    version?: string;
    type?: string;
    description?: string;
    downloadLink?: string;
    creditTo?: string;
    categories?: string[];
    tags?: string[];
}

export { Mod };
