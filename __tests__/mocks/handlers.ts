import { http, graphql, HttpResponse } from 'msw';

const BASE_URL = 'https://api.chanomhub.com';

export const handlers = [
    // Happy path: Get Articles
    graphql.query('GetArticles', () => {
        return HttpResponse.json({
            data: {
                public: {
                    articles: [
                        {
                            id: 1,
                            title: 'Test Article 1',
                            slug: 'test-article-1',
                            mainImage: 'article1.jpg',
                            status: 'PUBLISHED',
                            engine: { id: 'ng1', name: 'RenPy' },
                            author: { name: 'Author 1', image: 'auth1.jpg' },
                            creators: [],
                            tags: [],
                            platforms: [],
                            categories: [],
                            images: [],
                        },
                        {
                            id: 2,
                            title: 'Test Article 2',
                            slug: 'test-article-2',
                            mainImage: 'https://external.com/image.jpg',
                            status: 'PUBLISHED',
                            engine: { id: 'ng2', name: 'Unity' },
                            author: { name: 'Author 2', image: 'auth2.jpg' },
                            creators: [],
                            tags: [],
                            platforms: [],
                            categories: [],
                            images: [],
                        },
                    ],
                },
            },
        });
    }),

    // Paginated Articles
    graphql.query('GetArticlesPaginated', () => {
        return HttpResponse.json({
            data: {
                public: {
                    articles: [
                        {
                            id: 1,
                            title: 'Article 1',
                            slug: 'article-1',
                            mainImage: 'img1.jpg',
                            author: { name: 'A1', image: null },
                            tags: [],
                            platforms: [],
                            categories: [],
                            creators: [],
                            images: [],
                        },
                        {
                            id: 2,
                            title: 'Article 2',
                            slug: 'article-2',
                            mainImage: 'img2.jpg',
                            author: { name: 'A2', image: null },
                            tags: [],
                            platforms: [],
                            categories: [],
                            creators: [],
                            images: [],
                        },
                    ],
                    articlesCount: 100,
                },
            },
        });
    }),

    // Search Articles
    graphql.query('SearchArticles', () => {
        return HttpResponse.json({
            data: {
                public: {
                    articles: [
                        {
                            id: 1,
                            title: 'Found Article',
                            slug: 'found-article',
                            mainImage: 'found.jpg',
                            author: { name: 'Author', image: null },
                            tags: [],
                            engine: { id: 'e1', name: 'RenPy' },
                        },
                    ],
                    articlesCount: 1,
                },
            },
        });
    }),

    // Articles by Tag/Platform/Category
    graphql.query('GetArticlesByTag', () => {
        return HttpResponse.json({
            data: {
                public: {
                    articles: [
                        {
                            id: 1,
                            title: 'Tagged Article',
                            slug: 'tagged',
                            mainImage: null,
                            author: { name: 'A', image: null },
                            tags: [],
                            platforms: [],
                            categories: [],
                            creators: [],
                            images: [],
                        },
                    ],
                },
            },
        });
    }),

    graphql.query('GetArticlesByPlatform', () => {
        return HttpResponse.json({
            data: {
                public: {
                    articles: [
                        {
                            id: 1,
                            title: 'Platform Article',
                            slug: 'platform',
                            mainImage: null,
                            author: { name: 'A', image: null },
                            tags: [],
                            platforms: [],
                            categories: [],
                            creators: [],
                            images: [],
                        },
                    ],
                },
            },
        });
    }),

    graphql.query('GetArticlesByCategory', () => {
        return HttpResponse.json({
            data: {
                public: {
                    articles: [
                        {
                            id: 1,
                            title: 'Category Article',
                            slug: 'category',
                            mainImage: null,
                            author: { name: 'A', image: null },
                            tags: [],
                            platforms: [],
                            categories: [],
                            creators: [],
                            images: [],
                        },
                    ],
                },
            },
        });
    }),

    // Happy path: Get Article By Slug
    graphql.query('GetArticleBySlug', ({ variables }) => {
        const { slug } = variables;

        if (slug === 'not-found') {
            return HttpResponse.json({
                data: {
                    public: {
                        article: null,
                    },
                },
            });
        }

        return HttpResponse.json({
            data: {
                public: {
                    article: {
                        id: 1,
                        title: 'Test Article 1',
                        slug: slug as string,
                        description: 'A test article',
                        body: 'This is the body content',
                        ver: '1.0',
                        createdAt: '2023-01-01',
                        updatedAt: '2023-01-02',
                        status: 'PUBLISHED',
                        engine: { id: 'ng1', name: 'RenPy' },
                        mainImage: 'article1.jpg',
                        backgroundImage: 'bg.jpg',
                        coverImage: 'cover.jpg',
                        favorited: false,
                        favoritesCount: 10,
                        sequentialCode: '001',
                        author: {
                            name: 'John Doe',
                            bio: 'Bio',
                            image: 'john.jpg',
                            backgroundImage: 'auth_bg.jpg',
                            following: false,
                            socialMediaLinks: [],
                        },
                        images: [
                            { id: 'img1', url: 'img1.jpg' },
                            { id: 'img2', url: 'img2.jpg' },
                        ],
                        creators: [],
                        tags: [],
                        platforms: [],
                        categories: [],
                        mods: [],
                    },
                },
            },
        });
    }),

    // Get Article with Downloads (Legacy / Combined)
    graphql.query('GetArticleWithDownloads', () => {
        return HttpResponse.json({
            data: {
                public: {
                    article: {
                        id: 1,
                        title: 'Article With Downloads',
                        slug: 'with-downloads',
                        description: 'Desc',
                        body: 'Body',
                        ver: '1.0',
                        createdAt: '2023-01-01',
                        updatedAt: '2023-01-01',
                        status: 'PUBLISHED',
                        engine: { id: 'e1', name: 'RenPy' },
                        mainImage: 'main.jpg',
                        backgroundImage: null,
                        coverImage: null,
                        favorited: false,
                        favoritesCount: 5,
                        sequentialCode: '001',
                        author: {
                            name: 'Author',
                            bio: null,
                            image: null,
                            backgroundImage: null,
                            following: false,
                            socialMediaLinks: [],
                        },
                        images: [],
                        creators: [],
                        tags: [],
                        platforms: [],
                        categories: [],
                        mods: [],
                    },
                    downloads: [
                        {
                            id: 1,
                            name: 'Download 1',
                            url: 'https://dl.com/1',
                            isActive: true,
                            vipOnly: false,
                        },
                    ],
                    officialDownloadSources: [],
                },
            },
        });
    }),

    // New: Get Article Downloads
    graphql.query('GetArticleDownloads', ({ variables }) => {
        const { articleId } = variables;
        return HttpResponse.json({
            data: {
                public: {
                    downloads: [
                        {
                            id: 1,
                            articleId: articleId as number,
                            name: `Download for ${articleId}`,
                            url: 'https://dl.com/1',
                            isActive: true,
                            vipOnly: false,
                            forVersion: '1.0',
                            createdAt: '2023-01-01',
                            updatedAt: '2023-01-01',
                        },
                    ],
                },
            },
        });
    }),

    // New: Get Official Download Sources
    graphql.query('GetOfficialDownloadSources', ({ variables }) => {
        const { articleId } = variables;
        return HttpResponse.json({
            data: {
                public: {
                    officialDownloadSources: [
                        {
                            id: 'source1',
                            name: `Official Source for ${articleId}`,
                            url: 'https://official.com/1',
                            status: 'APPROVED',
                        },
                    ],
                },
            },
        });
    }),

    // System Queries
    graphql.query('GetTags', () => {
        return HttpResponse.json({
            data: {
                system: {
                    tags: ['renpy', 'unity', 'rpgmaker'],
                },
            },
        });
    }),

    graphql.query('GetCategories', () => {
        return HttpResponse.json({
            data: {
                system: {
                    categories: ['Action', 'RPG', 'Strategy'],
                },
            },
        });
    }),

    graphql.query('GetPlatforms', () => {
        return HttpResponse.json({
            data: {
                system: {
                    platforms: ['Windows', 'macOS', 'Linux', 'Android', 'iOS'],
                },
            },
        });
    }),

    // Error path: Internal Server Error simulation
    graphql.query('ServerErrorQuery', () => {
        return new HttpResponse(null, { status: 500 });
    }),

    // Error path: GraphQL Error simulation
    graphql.query('GraphQLErrorQuery', () => {
        return HttpResponse.json({
            errors: [{ message: 'Something went wrong in GraphQL' }],
        });
    }),

    // ===================== REST API Handlers =====================

    // Favorites - Add
    http.post(`${BASE_URL}/api/articles/:slug/favorite`, ({ params }) => {
        const { slug } = params;
        if (slug === 'unauthorized') {
            return new HttpResponse(null, { status: 401 });
        }
        return HttpResponse.json({
            article: {
                id: 1,
                slug,
                title: 'Favorited Article',
                favorited: true,
                favoritesCount: 11,
            },
        });
    }),

    // Favorites - Remove
    http.delete(`${BASE_URL}/api/articles/:slug/favorite`, ({ params }) => {
        const { slug } = params;
        return HttpResponse.json({
            article: {
                id: 1,
                slug,
                title: 'Unfavorited Article',
                favorited: false,
                favoritesCount: 10,
            },
        });
    }),

    // Users - Get Current User
    http.get(`${BASE_URL}/api/user`, ({ request }) => {
        const auth = request.headers.get('Authorization');
        if (!auth) {
            return new HttpResponse(null, { status: 401 });
        }
        return HttpResponse.json({
            user: {
                id: 1,
                email: 'test@example.com',
                username: 'testuser',
                bio: 'Hello',
                image: 'avatar.jpg',
            },
        });
    }),

    // Profiles - Get Profile
    http.get(`${BASE_URL}/api/profiles/:username`, ({ params }) => {
        const { username } = params;
        if (username === 'notfound') {
            return new HttpResponse(null, { status: 404 });
        }
        return HttpResponse.json({
            profile: {
                id: 1,
                name: username as string,
                bio: 'User bio',
                image: 'profile.jpg',
                backgroundImage: 'bg.jpg',
                following: false,
                socialMediaLinks: [],
            },
        });
    }),

    // Profiles - Follow
    http.post(`${BASE_URL}/api/profiles/:username/follow`, ({ params }) => {
        const { username } = params;
        return HttpResponse.json({
            profile: {
                id: 1,
                name: username as string,
                bio: 'User bio',
                image: 'profile.jpg',
                backgroundImage: 'bg.jpg',
                following: true,
                socialMediaLinks: [],
            },
        });
    }),

    // Profiles - Unfollow
    http.delete(`${BASE_URL}/api/profiles/:username/follow`, ({ params }) => {
        const { username } = params;
        return HttpResponse.json({
            profile: {
                id: 1,
                name: username as string,
                bio: 'User bio',
                image: 'profile.jpg',
                backgroundImage: 'bg.jpg',
                following: false,
                socialMediaLinks: [],
            },
        });
    }),

    // ===================== Sponsored Articles =====================

    // GraphQL: Get Sponsored Articles
    graphql.query('GetSponsoredArticles', () => {
        return HttpResponse.json({
            data: {
                public: {
                    sponsoredArticles: [
                        {
                            id: 1,
                            articleId: 10,
                            coverImage: 'sponsored-cover.jpg',
                            isActive: true,
                            priority: 10,
                            startDate: '2026-01-01T00:00:00Z',
                            endDate: null,
                            article: {
                                id: 10,
                                title: 'Sponsored Game',
                                slug: 'sponsored-game',
                                description: 'A promoted game',
                                mainImage: 'game-main.jpg',
                                author: { name: 'GameDev', image: 'dev.jpg' },
                                tags: [{ id: 't1', name: 'renpy' }],
                                platforms: [],
                                categories: [],
                                creators: [],
                                images: [],
                            },
                        },
                        {
                            id: 2,
                            articleId: 20,
                            coverImage: null,
                            isActive: true,
                            priority: 5,
                            startDate: '2026-02-01T00:00:00Z',
                            endDate: '2026-12-31T23:59:59Z',
                            article: {
                                id: 20,
                                title: 'Another Sponsored Game',
                                slug: 'another-sponsored',
                                description: 'Another promoted game',
                                mainImage: 'another-main.jpg',
                                author: { name: 'Dev2', image: null },
                                tags: [],
                                platforms: [],
                                categories: [],
                                creators: [],
                                images: [],
                            },
                        },
                    ],
                },
            },
        });
    }),

    // REST: Get Sponsored Article by ID
    http.get(`${BASE_URL}/api/sponsored-articles/:id`, ({ params }) => {
        const { id } = params;
        if (id === '999') {
            return new HttpResponse(null, { status: 404 });
        }
        return HttpResponse.json({
            id: Number(id),
            articleId: 10,
            coverImage: 'sponsored-cover.jpg',
            isActive: true,
            priority: 10,
            startDate: '2026-01-01T00:00:00Z',
            endDate: null,
            article: {
                id: 10,
                title: 'Sponsored Game',
                slug: 'sponsored-game',
            },
        });
    }),

    // REST: Create Sponsored Article
    http.post(`${BASE_URL}/api/sponsored-articles`, async ({ request }) => {
        const auth = request.headers.get('Authorization');
        if (!auth) {
            return new HttpResponse(null, { status: 401 });
        }
        const body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
            id: 3,
            articleId: body.articleId,
            coverImage: body.coverImage ?? null,
            isActive: body.isActive ?? true,
            priority: body.priority ?? 0,
            startDate: body.startDate ?? '2026-03-01T00:00:00Z',
            endDate: body.endDate ?? null,
        });
    }),

    // REST: Update Sponsored Article
    http.put(`${BASE_URL}/api/sponsored-articles/:id`, async ({ request, params }) => {
        const auth = request.headers.get('Authorization');
        if (!auth) {
            return new HttpResponse(null, { status: 401 });
        }
        const body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
            id: Number(params.id),
            articleId: 10,
            coverImage: body.coverImage ?? 'sponsored-cover.jpg',
            isActive: body.isActive ?? true,
            priority: body.priority ?? 10,
            startDate: '2026-01-01T00:00:00Z',
            endDate: body.endDate ?? null,
        });
    }),

    // REST: Delete Sponsored Article
    http.delete(`${BASE_URL}/api/sponsored-articles/:id`, ({ request }) => {
        const auth = request.headers.get('Authorization');
        if (!auth) {
            return new HttpResponse(null, { status: 401 });
        }
        return new HttpResponse(null, { status: 204 });
    }),
];
