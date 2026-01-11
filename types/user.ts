/**
 * Chanomhub SDK - User Types
 */

/** Current logged-in user */
export interface User {
    id: number;
    email: string;
    username: string;
    bio: string | null;
    image: string | null;
    token?: string;
}

/** User response wrapper */
export interface UserResponse {
    user: User;
}

/** Social media link */
export interface SocialMediaLink {
    platform: string;
    url: string;
}

/** Public profile */
export interface Profile {
    id: number;
    /** Display name (API returns as 'name') */
    name: string;
    /** Username (for API calls) */
    username?: string;
    bio: string | null;
    image: string | null;
    backgroundImage: string | null;
    following: boolean;
    socialMediaLinks: SocialMediaLink[];
}

/** Profile response wrapper */
export interface ProfileResponse {
    profile: Profile;
}
