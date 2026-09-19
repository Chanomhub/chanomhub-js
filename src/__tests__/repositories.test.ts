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

    describe('DeveloperRepository', () => {
        it('should list verified developers', async () => {
            const client = createChanomhubClient();
            const developers = await client.developer.listVerifiedDevelopers();

            expect(developers).toHaveLength(2);
            expect(developers[0].name).toBe('Developer 1');
            expect(developers[1].id).toBe(2);
        });
    });

    describe('ModsRepository', () => {
        it('should get mods by article slug', async () => {
            const client = createChanomhubClient();
            const mods = await client.mods.getByArticle('test-game', { status: 'APPROVED' });

            expect(mods).toHaveLength(1);
            expect(mods[0].id).toBe(101);
            expect(mods[0].name).toBe('Test Mod');
            expect(mods[0].status).toBe('APPROVED');
        });

        it('should get all mods with pagination and filters', async () => {
            const client = createChanomhubClient();
            const result = await client.mods.getAll({
                skip: 0,
                take: 10,
                status: 'APPROVED',
                type: 'TRANSLATION',
                language: 'th',
            });

            expect(result.mods).toHaveLength(1);
            expect(result.modsCount).toBe(1);
            expect(result.mods[0].name).toBe('All Mods Item');
        });

        it('should get mod by id', async () => {
            const client = createChanomhubClient();
            const mod = await client.mods.getById(42);

            expect(mod.id).toBe(42);
            expect(mod.name).toBe('Mod by ID');
            expect(mod.languages).toEqual(['th', 'en']);
            expect(mod.sha256).toBeDefined();
            expect(mod.fileSizeBytes).toBe(1024);
        });

        it('should require authentication to create a mod', async () => {
            const unauthenticated = createChanomhubClient();
            await expect(
                unauthenticated.mods.create('test-game', { downloadLink: 'https://example.com/mod.zip' }),
            ).rejects.toThrow('Authentication required');
        });

        it('should create a mod with authenticated client', async () => {
            const client = createAuthenticatedClient('test-token');
            const mod = await client.mods.create('test-game', {
                name: 'Custom Mod',
                downloadLink: 'https://example.com/mod.zip',
                type: 'MOD',
            });

            expect(mod.id).toBe(102);
            expect(mod.name).toBe('Custom Mod');
            expect(mod.status).toBe('PENDING');
        });

        it('should submit an NST translation pack', async () => {
            const client = createAuthenticatedClient('test-token');
            const mod = await client.mods.submitNstTranslation('test-game', {
                downloadLink: 'https://storage.chanomhub.com/trans.zip',
                language: 'Thai',
                engine: 'renpy',
                sha256: 'abc123hash',
            });

            expect(mod.id).toBe(103);
            expect(mod.name).toBe('NST Thai Translation');
            expect(mod.type).toBe('TRANSLATION');
        });

        it('should update a mod', async () => {
            const client = createAuthenticatedClient('test-token');
            const updated = await client.mods.update(101, {
                name: 'Updated Mod Name',
            });

            expect(updated.id).toBe(101);
            expect(updated.name).toBe('Updated Mod Name');
        });

        it('should update mod status', async () => {
            const client = createAuthenticatedClient('test-token');
            const updated = await client.mods.updateStatus(101, 'APPROVED');

            expect(updated.id).toBe(101);
            expect(updated.status).toBe('APPROVED');
        });

        it('should delete a mod', async () => {
            const client = createAuthenticatedClient('test-token');
            await expect(client.mods.delete(101)).resolves.toBeUndefined();
        });

        it('should publish translation pack (upload + submit)', async () => {
            const client = createAuthenticatedClient('test-token');
            const fileData = new Uint8Array([80, 75, 3, 4]); // Zip magic bytes
            const mod = await client.mods.publishTranslationPack('test-game', fileData, {
                language: 'Thai',
                engine: 'renpy',
                filename: 'pack.zip',
            });

            expect(mod.id).toBe(103);
            expect(mod.downloadLink).toContain('oi.chanomhub.com');
        });
    });
});
