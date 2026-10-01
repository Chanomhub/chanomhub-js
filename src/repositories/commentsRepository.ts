/**
 * Chanomhub SDK - Comments Repository
 */

import type { RestFetcher } from '../client';
import type {
    Comment,
    CommentListResponse,
    CreateCommentDTO,
    CommentListOptions,
} from '../types';

export interface CommentsRepository {
    /** Get list of comments for an article */
    list(slug: string, options?: CommentListOptions): Promise<CommentListResponse>;
    /** Create a new comment or reply */
    create(slug: string, data: CreateCommentDTO): Promise<Comment>;
    /** Delete a comment */
    delete(slug: string, commentId: number): Promise<Comment>;
}

export function createCommentsRepository(rest: RestFetcher): CommentsRepository {
    async function list(slug: string, options: CommentListOptions = {}): Promise<CommentListResponse> {
        const { page = 1, limit = 50 } = options;
        const params = new URLSearchParams();
        if (page) params.set('page', String(page));
        if (limit) params.set('limit', String(limit));
        const query = params.toString() ? `?${params.toString()}` : '';

        const res = await rest<CommentListResponse>(`/api/articles/${slug}/comments${query}`);
        if (res.error || !res.data) {
            throw new Error(res.error || 'Failed to fetch comments');
        }
        return res.data;
    }

    async function create(slug: string, data: CreateCommentDTO): Promise<Comment> {
        const res = await rest<Comment>(`/api/articles/${slug}/comments`, {
            method: 'POST',
            body: data as unknown as Record<string, unknown>,
        });
        if (res.error || !res.data) {
            throw new Error(res.error || 'Failed to create comment');
        }
        return res.data;
    }

    async function remove(slug: string, commentId: number): Promise<Comment> {
        const res = await rest<Comment>(`/api/articles/${slug}/comments/${commentId}`, {
            method: 'DELETE',
        });
        if (res.error || !res.data) {
            throw new Error(res.error || 'Failed to delete comment');
        }
        return res.data;
    }

    return {
        list,
        create,
        delete: remove,
    };
}
