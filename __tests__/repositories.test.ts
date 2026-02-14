import { describe, it, expect } from 'vitest';
import { createChanomhubClient, createAuthenticatedClient } from '../index';

describe('Repositories Integration Tests', () => {
    describe('ArticleRepository', () => {
        it('should get paginated articles', async () => {
            const client = createChanomhubClient();
            const result = await client.articles.getAllPaginated({ limit: 10, offset: 0 });

            expect(result.items).toHaveLength(2);
            expect(result.total).toBe(100);
            expect(result.page).toBe(1);
            expect(result.pageSize).toBe(10);
        });

        it('should get articles by tag', async () => {
            const client = createChanomhubClient();
            const articles = await client.articles.getByTag('renpy');

            expect(articles).toHaveLength(1);
            expect(articles[0].title).toBe('Tagged Article');
        });

        it('should get articles by platform', async () => {
            const client = createChanomhubClient();
            const articles = await client.articles.getByPlatform('windows');

            expect(articles).toHaveLength(1);
            expect(articles[0].title).toBe('Platform Article');
        });

        it('should get articles by category', async () => {
            const client = createChanomhubClient();
            const articles = await client.articles.getByCategory('action');

            expect(articles).toHaveLength(1);
            expect(articles[0].title).toBe('Category Article');
        });

        it('should get article with downloads', async () => {
            const client = createChanomhubClient();
            const result = await client.articles.getWithDownloads('with-downloads');

            expect(result.article).not.toBeNull();
            expect(result.downloads).toHaveLength(1);
        });

        it('should get all tags', async () => {
            const client = createChanomhubClient();
            const tags = await client.articles.getTags();

            expect(tags).toContain('renpy');
            expect(tags).toContain('unity');
            expect(tags).toHaveLength(3);
        });

        it('should get all categories', async () => {
            const client = createChanomhubClient();
            const categories = await client.articles.getCategories();

            expect(categories).toContain('RPG');
            expect(categories).toHaveLength(3);
        });

        it('should get all platforms', async () => {
            const client = createChanomhubClient();
            const platforms = await client.articles.getPlatforms();

            expect(platforms).toContain('Windows');
            expect(platforms).toHaveLength(5);
        });
    });

    describe('SearchRepository', () => {
        it('should search articles', async () => {
            const client = createChanomhubClient();
            const result = await client.search.articles('test query');

            expect(result.items).toHaveLength(1);
            expect(result.items[0].title).toBe('Found Article');
            expect(result.total).toBe(1);
        });

        it('should search with filters', async () => {
            const client = createChanomhubClient();
            const result = await client.search.articles('game', { tag: 'renpy', limit: 5 });

            expect(result.items).toHaveLength(1);
            expect(result.pageSize).toBe(5);
        });
    });

    describe('FavoritesRepository', () => {
        it('should add article to favorites', async () => {
            const client = createAuthenticatedClient('test-token');
            const result = await client.favorites.add('test-article');

            expect(result).not.toBeNull();
            expect(result?.article.favorited).toBe(true);
        });

        it('should remove article from favorites', async () => {
            const client = createAuthenticatedClient('test-token');
            const result = await client.favorites.remove('test-article');

            expect(result).not.toBeNull();
            expect(result?.article.favorited).toBe(false);
        });

        it('should throw AuthenticationError when not authenticated', async () => {
            const client = createChanomhubClient(); // No token
            await expect(client.favorites.add('test-article')).rejects.toThrow(
                'Authentication required for favorites',
            );
        });
    });

    describe('UsersRepository', () => {
        it('should get current user when authenticated', async () => {
            const client = createAuthenticatedClient('test-token');
            const user = await client.users.getCurrentUser();

            expect(user).not.toBeNull();
            expect(user?.username).toBe('testuser');
            expect(user?.email).toBe('test@example.com');
        });

        it('should return null when not authenticated', async () => {
            const client = createChanomhubClient();
            const user = await client.users.getCurrentUser();

            expect(user).toBeNull();
        });

        it('should get user profile', async () => {
            const client = createChanomhubClient();
            const profile = await client.users.getProfile('testuser');

            expect(profile).not.toBeNull();
            expect(profile?.name).toBe('testuser');
            expect(profile?.following).toBe(false);
        });

        it('should follow user', async () => {
            const client = createAuthenticatedClient('test-token');
            const profile = await client.users.follow('testuser');

            expect(profile).not.toBeNull();
            expect(profile?.following).toBe(true);
        });

        it('should unfollow user', async () => {
            const client = createAuthenticatedClient('test-token');
            const profile = await client.users.unfollow('testuser');

            expect(profile).not.toBeNull();
            expect(profile?.following).toBe(false);
        });
    });
});
