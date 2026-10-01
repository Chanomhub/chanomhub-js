/**
 * Chanomhub SDK - Comment Types
 */

export interface CommentAuthor {
    username: string;
    bio: string | null;
    image: string | null;
    following: boolean;
}

export interface Comment {
    id: number;
    parentId?: number | null;
    body: string;
    createdAt: string;
    updatedAt: string;
    author: CommentAuthor;
    replies?: Comment[];
}

export interface CommentListResponse {
    comments: Comment[];
    commentsCount: number;
}

export interface CreateCommentDTO {
    body: string;
    parentId?: number;
}

export interface CommentListOptions {
    page?: number;
    limit?: number;
}
