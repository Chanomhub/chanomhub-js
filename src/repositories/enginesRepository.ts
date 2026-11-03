/**
 * Chanomhub SDK - Engines Repository
 *
 * Engine taxonomy and file-based engine auto-detection.
 */

import type { RestFetcher } from '../client';

export interface NamedEntity {
    id: number;
    name: string;
}

export interface EngineDetectResult {
    engine: string;
    engineId?: number;
    confidence?: number;
    signature?: string;
}

export interface EnginesRepository {
    /**
     * Get all available game engines
     */
    getAll(): Promise<NamedEntity[]>;

    /**
     * Detect the game engine from an uploaded file
     * @param url - URL of the uploaded game file
     * @returns Detected engine info, or null on failure
     */
    detect(url: string): Promise<EngineDetectResult | null>;
}

/**
 * Creates an engines repository with the given REST client
 */
export function createEnginesRepository(rest: RestFetcher): EnginesRepository {
    async function getAll(): Promise<NamedEntity[]> {
        const res = await rest<NamedEntity[]>('/api/engines');

        if (res.error || !res.data) {
            console.error('Failed to fetch engines:', res.error);
            return [];
        }

        return res.data;
    }

    async function detect(url: string): Promise<EngineDetectResult | null> {
        const res = await rest<EngineDetectResult>('/api/engines/detect', {
            method: 'POST',
            body: { url },
        });

        if (res.error || !res.data) {
            console.error('Engine detection failed:', res.error);
            return null;
        }

        return res.data;
    }

    return {
        getAll,
        detect,
    };
}
