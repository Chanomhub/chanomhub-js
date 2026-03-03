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
    points: number;
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

/** Developer verification profile */
export interface DeveloperProfile {
    id: number;
    userId: number;
    realName: string;
    bankName: string;
    bankAccount: string;
    citizenId?: string;
    isVerified: boolean;
    verifiedAt?: string;
    createdAt: string;
    updatedAt: string;
}

/** Developer verification request */
export interface VerifyDeveloperDto {
    realName: string;
    bankName: string;
    bankAccount: string;
    citizenId?: string;
}

/** One-time verification token */
export interface OneTimeToken {
    id: string;
    userId: number;
    token: string;
    type: 'DEVELOPER_VERIFICATION';
    expiresAt: string;
    createdAt: string;
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
