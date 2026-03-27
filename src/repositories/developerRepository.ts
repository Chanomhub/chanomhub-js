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
     * Start the developer application process for the current user.
     * Generates a one-time verification token.
     */
    startApplication(): Promise<OneTimeToken>;

    /**
     * Submit developer profile details for admin review.
     * 
     * @param data - Developer identity and payout details
     */
    submitApplication(data: VerifyDeveloperDto): Promise<DeveloperProfile>;

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
    getProfile(): Promise<DeveloperProfile | null>;

    /**
     * Update the developer profile for the currently authenticated user.
     * 
     * @param data - Developer verification details to update
     */
    updateProfile(data: Partial<VerifyDeveloperDto>): Promise<DeveloperProfile>;

    /**
     * Get all developer profiles.
     * Admin only.
     */
    getAllProfiles(): Promise<DeveloperProfile[]>;

    /**
     * List all verified developers (Public).
     */
    listVerifiedDevelopers(): Promise<{ id: number; name: string }[]>;
}

/**
 * Creates a developer repository
 * 
 * @param fetcher - REST API fetcher
 */
export function createDeveloperRepository(fetcher: RestFetcher): DeveloperRepository {
    async function listVerifiedDevelopers(): Promise<{ id: number; name: string }[]> {
        const { data, error } = await fetcher<{ id: number; name: string }[]>('/api/developer/list');
        if (error) throw error;
        return data || [];
    }

    async function getAllProfiles(): Promise<DeveloperProfile[]> {
        const { data, error } = await fetcher<DeveloperProfile[]>('/api/admin/developer/profiles');

        if (error) {
            throw error;
        }

        return data || [];
    }

    async function generateVerificationToken(userId: number): Promise<OneTimeToken> {
        const { data, error } = await fetcher<OneTimeToken>('/api/admin/developer/generate-token', {
            method: 'POST',
            body: { userId },
        });

        if (error) {
            throw error;
        }

        if (!data) {
            throw new Error('Failed to generate token: No data returned from server');
        }

        return data;
    }

    async function startApplication(): Promise<OneTimeToken> {
        const { data, error } = await fetcher<OneTimeToken>('/api/developer/generate-token', {
            method: 'POST',
        });

        if (error) {
            throw error;
        }

        if (!data) {
            throw new Error('Failed to start application: No token data returned from server');
        }

        return data;
    }

    async function submitApplication(data: VerifyDeveloperDto): Promise<DeveloperProfile> {
        const { data: profile, error } = await fetcher<DeveloperProfile>('/api/developer/apply', {
            method: 'POST',
            body: data as unknown as Record<string, unknown>,
        });

        if (error) {
            throw error;
        }

        if (!profile) {
            throw new Error('Failed to submit application: No profile data returned from server');
        }

        return profile;
    }

    async function verifyDeveloper(token: string, data: VerifyDeveloperDto): Promise<DeveloperProfile> {
        const { data: profile, error } = await fetcher<DeveloperProfile>(`/api/developer/verify/${token}`, {
            method: 'POST',
            body: data as unknown as Record<string, unknown>,
        });

        if (error) {
            throw error;
        }

        if (!profile) {
            throw new Error('Failed to verify developer: No profile data returned from server');
        }

        return profile;
    }

    async function getProfile(): Promise<DeveloperProfile | null> {
        const { data: profile, error } = await fetcher<DeveloperProfile>('/api/developer/profile');

        if (error) {
            // Handle 404 as a valid "no profile" state
            if (error.includes('404')) {
                return null;
            }
            throw error;
        }

        return profile;
    }

    async function updateProfile(data: Partial<VerifyDeveloperDto>): Promise<DeveloperProfile> {
        const { data: profile, error } = await fetcher<DeveloperProfile>('/api/developer/profile', {
            method: 'PATCH',
            body: data as unknown as Record<string, unknown>,
        });

        if (error) {
            throw error;
        }

        if (!profile) {
            throw new Error('Failed to update developer profile: No data returned from server');
        }

        return profile;
    }

    return {
        generateVerificationToken,
        startApplication,
        submitApplication,
        verifyDeveloper,
        getProfile,
        updateProfile,
        getAllProfiles,
    };
}
