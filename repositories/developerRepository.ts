/**
 * Chanomhub SDK - Developer Repository
 * 
 * Handles developer verification and profile management.
 */

import type { RestFetcher } from '../client';
import type { 
    DeveloperProfile, 
    VerifyDeveloperDto, 
    OneTimeToken 
} from '../types/user';

export interface DeveloperRepository {
    /**
     * Generate a one-time verification token for a user.
     * Admin only.
     * 
     * @param userId - The ID of the user to generate a token for
     */
    generateVerificationToken(userId: number): Promise<OneTimeToken>;

    /**
     * Verify developer status using a one-time token.
     * Requires authentication as the user the token belongs to.
     * 
     * @param token - The one-time verification token
     * @param data - Developer verification details (real name, bank account, etc.)
     */
    verifyDeveloper(token: string, data: VerifyDeveloperDto): Promise<DeveloperProfile>;

    /**
     * Get the developer profile for the currently authenticated user.
     */
    getProfile(): Promise<DeveloperProfile>;
}

/**
 * Creates a developer repository
 * 
 * @param fetcher - REST API fetcher
 */
export function createDeveloperRepository(fetcher: RestFetcher): DeveloperRepository {
    async function generateVerificationToken(userId: number): Promise<OneTimeToken> {
        const { data, error } = await fetcher<OneTimeToken>('/admin/developer/generate-token', {
            method: 'POST',
            body: { userId },
        });

        if (error) {
            throw error;
        }

        return data;
    }

    async function verifyDeveloper(token: string, data: VerifyDeveloperDto): Promise<DeveloperProfile> {
        const { data: profile, error } = await fetcher<DeveloperProfile>(`/developer/verify/${token}`, {
            method: 'POST',
            body: data,
        });

        if (error) {
            throw error;
        }

        return profile;
    }

    async function getProfile(): Promise<DeveloperProfile> {
        const { data: profile, error } = await fetcher<DeveloperProfile>('/developer/profile');

        if (error) {
            throw error;
        }

        return profile;
    }

    return {
        generateVerificationToken,
        verifyDeveloper,
        getProfile,
    };
}
