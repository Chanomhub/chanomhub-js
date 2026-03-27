/**
 * Chanomhub SDK - Users Repository
 */

import type { RestFetcher } from '../client';
import type { ChanomhubConfig } from '../config';
import type { User, UserResponse, Profile, ProfileResponse } from '../types/user';
import { transformImageUrlsDeep } from '../transforms/imageUrl';

export interface UsersRepository {
    /** Get current logged-in user */
    getCurrentUser(): Promise<User | null>;

    /** Get public profile by username */
    getProfile(username: string): Promise<Profile | null>;

    /** Follow a user */
    follow(username: string): Promise<Profile | null>;

    /** Unfollow a user */
    unfollow(username: string): Promise<Profile | null>;
}

/**
 * Creates a users repository with the given REST client
 */
export function createUsersRepository(
    fetcher: RestFetcher,
    config?: ChanomhubConfig,
): UsersRepository {
    const cdnUrl = config?.cdnUrl || 'https://imgproxy.chanomhub.com';

    async function getCurrentUser(): Promise<User | null> {
        const { data, error } = await fetcher<UserResponse>('/api/user');

        if (error) {
            console.error('Failed to get current user:', error);
            return null;
        }

        return data?.user ? transformImageUrlsDeep(data.user, cdnUrl) : null;
    }

    async function getProfile(username: string): Promise<Profile | null> {
        const { data, error } = await fetcher<ProfileResponse>(
            `/api/profiles/${encodeURIComponent(username)}`,
        );

        if (error) {
            console.error('Failed to get profile:', error);
            return null;
        }

        return data?.profile ? transformImageUrlsDeep(data.profile, cdnUrl) : null;
    }

    async function follow(username: string): Promise<Profile | null> {
        const { data, error } = await fetcher<ProfileResponse>(
            `/api/profiles/${encodeURIComponent(username)}/follow`,
            { method: 'POST' },
        );

        if (error) {
            console.error('Failed to follow user:', error);
            return null;
        }

        return data?.profile ? transformImageUrlsDeep(data.profile, cdnUrl) : null;
    }

    async function unfollow(username: string): Promise<Profile | null> {
        const { data, error } = await fetcher<ProfileResponse>(
            `/api/profiles/${encodeURIComponent(username)}/follow`,
            { method: 'DELETE' },
        );

        if (error) {
            console.error('Failed to unfollow user:', error);
            return null;
        }

        return data?.profile ?? null;
    }

    return {
        getCurrentUser,
        getProfile,
        follow,
        unfollow,
    };
}
