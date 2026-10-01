import { describe, it, expect } from 'vitest';
import { createChanomhubClient } from '../index';

describe('CommentsRepository Integration Tests', () => {
    it('should list comments for an article', async () => {
        const client = createChanomhubClient();
        const result = await client.comments.list('test-game');

        expect(result.commentsCount).toBe(2);
        expect(result.comments).toHaveLength(1);
        expect(result.comments[0].id).toBe(1);
        expect(result.comments[0].body).toBe('Great article!');
        expect(result.comments[0].replies).toHaveLength(1);
        expect(result.comments[0].replies?.[0].id).toBe(2);
        expect(result.comments[0].replies?.[0].body).toBe('Thanks!');
    });

    it('should create a comment via client.comments', async () => {
        const client = createChanomhubClient({ token: 'test-token' });
        const comment = await client.comments.create('test-game', {
            body: 'Hello world!',
        });

        expect(comment.id).toBe(3);
        expect(comment.body).toBe('Hello world!');
        expect(comment.parentId).toBeNull();
    });

    it('should create a reply via client.comments with parentId', async () => {
        const client = createChanomhubClient({ token: 'test-token' });
        const reply = await client.comments.create('test-game', {
            body: 'I agree!',
            parentId: 1,
        });

        expect(reply.id).toBe(3);
        expect(reply.body).toBe('I agree!');
        expect(reply.parentId).toBe(1);
    });

    it('should delete a comment via client.comments', async () => {
        const client = createChanomhubClient({ token: 'test-token' });
        const deleted = await client.comments.delete('test-game', 1);

        expect(deleted.id).toBe(1);
        expect(deleted.body).toBe('Deleted comment');
    });

    it('should support comments methods via client.articles', async () => {
        const client = createChanomhubClient({ token: 'test-token' });
        const list = await client.articles.getComments('test-game');
        expect(list.commentsCount).toBe(2);

        const newComment = await client.articles.addComment('test-game', {
            body: 'Via articles repo',
        });
        expect(newComment.id).toBe(3);

        const deleted = await client.articles.deleteComment('test-game', 1);
        expect(deleted.id).toBe(1);
    });
});
