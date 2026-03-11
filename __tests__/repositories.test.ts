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

        it('should resolve relative download URLs to storage URLs', async () => {
            const client = createChanomhubClient();
            const article = await client.articles.getBySlug('relative-downloads');

            expect(article).not.toBeNull();
            expect(article?.downloads).toHaveLength(1);
            const download = article?.downloads?.[0];
            expect(download?.url).toBe('https://storage.chanomhub.com/public/file.tar.xz');
            expect(download?.isDirectFile).toBe(true);
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

        it('should get official download sources', async () => {
            const client = createChanomhubClient();
            const sources = await client.articles.getOfficialDownloadSources(10);

            expect(sources).toHaveLength(1);
            expect(sources[0].name).toBe('Official Source for 10');
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

    describe('DownloadsRepository', () => {
        it('should get downloads by article ID via GraphQL', async () => {
            const client = createChanomhubClient();
            const downloads = await client.downloads.getByArticle(10);

            expect(downloads).toHaveLength(1);
            expect(downloads[0].name).toBe('Download for 10');
            expect(downloads[0].url).toBe('https://dl.com/1');
        });
    });

    describe('SponsoredArticlesRepository', () => {
        it('should get sponsored articles via GraphQL', async () => {
            const client = createChanomhubClient();
            const sponsored = await client.sponsoredArticles.getAll();

            expect(sponsored).toHaveLength(2);
            expect(sponsored[0].article.title).toBe('Sponsored Game');
            expect(sponsored[0].priority).toBe(10);
            expect(sponsored[0].isActive).toBe(true);
            expect(sponsored[1].coverImage).toBeNull();
        });

        it('should get sponsored article by ID', async () => {
            const client = createChanomhubClient();
            const sponsored = await client.sponsoredArticles.getById(1);

            expect(sponsored).not.toBeNull();
            expect(sponsored?.id).toBe(1);
            expect(sponsored?.articleId).toBe(10);
        });

        it('should create sponsored article (admin)', async () => {
            const client = createAuthenticatedClient('admin-token');
            const sponsored = await client.sponsoredArticles.create({
                articleId: 42,
                priority: 5,
            });

            expect(sponsored).not.toBeNull();
            expect(sponsored.articleId).toBe(42);
            expect(sponsored.priority).toBe(5);
        });

        it('should update sponsored article (admin)', async () => {
            const client = createAuthenticatedClient('admin-token');
            const sponsored = await client.sponsoredArticles.update(1, {
                priority: 20,
                isActive: false,
            });

            expect(sponsored).not.toBeNull();
            expect(sponsored.id).toBe(1);
            expect(sponsored.priority).toBe(20);
            expect(sponsored.isActive).toBe(false);
        });

        it('should delete sponsored article (admin)', async () => {
            const client = createAuthenticatedClient('admin-token');
            await expect(client.sponsoredArticles.delete(1)).resolves.not.toThrow();
        });

        it('should throw AuthenticationError when not authenticated', async () => {
            const client = createChanomhubClient(); // No token
            await expect(client.sponsoredArticles.create({ articleId: 1 })).rejects.toThrow(
                'Authentication required for sponsored articles management',
            );
        });
    });

    describe('CheckoutRepository', () => {
        it('should create article checkout with redirect URLs', async () => {
            const client = createAuthenticatedClient('test-token');
            const result = await client.checkout.purchaseArticle(123, {
                successUrl: 'https://mysite.com/success',
                cancelUrl: 'https://mysite.com/cancel',
            });

            expect(result.invoiceId).toBe('inv_123');
            expect(result.paymentUrl).toContain('https://mysite.com/success');
            expect(result.status).toBe('PENDING');
        });

        it('should create mod checkout', async () => {
            const client = createAuthenticatedClient('test-token');
            const result = await client.checkout.purchaseMod(456);

            expect(result.invoiceId).toBe('inv_123');
            expect(result.paymentUrl).toBe('https://stripe.com/checkout');
        });
    });

    describe('Article Purchase (REST)', () => {
        it('should purchase article with redirect URLs', async () => {
            const client = createAuthenticatedClient('test-token');
            const article = await client.articles.purchase(123, {
                successUrl: 'https://mysite.com/success',
            });

            expect(article.id).toBe(123);
            // In our mock, we put the successUrl in checkoutUrl for verification
            expect((article as any).checkoutUrl).toContain('https://mysite.com/success');
        });
    });
});
