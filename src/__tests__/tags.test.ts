import { describe, it, expect } from 'vitest';
import { createChanomhubClient } from '../index';
import { http, HttpResponse } from 'msw';
import { server } from './mocks/server';

describe('Tags, Categories, and Platforms Repositories', () => {
    const client = createChanomhubClient({
        apiUrl: 'https://api.example.com',
    });

    it('should fetch all tags from REST API', async () => {
        server.use(
            http.get('https://api.example.com/api/tags', ({ request }) => {
                const url = new URL(request.url);
                const all = url.searchParams.get('all');
                
                if (all === 'true') {
                    return HttpResponse.json({
                        data: { tags: ['tag1', 'tag2', 'tag3'] },
                        statusCode: 200,
                        timestamp: new Date().toISOString(),
                    });
                }
                return HttpResponse.json({
                    data: { tags: ['tag1', 'tag2'] },
                    statusCode: 200,
                    timestamp: new Date().toISOString(),
                });
            }),
        );

        const tags = await client.tags.getAll();
        expect(tags).toEqual(['tag1', 'tag2']);

        const allTags = await client.tags.getAll(true);
        expect(allTags).toEqual(['tag1', 'tag2', 'tag3']);
    });

    it('should fetch categories from REST API', async () => {
        server.use(
            http.get('https://api.example.com/api/categories', () => {
                return HttpResponse.json({
                    data: { categories: ['cat1', 'cat2'] },
                    statusCode: 200,
                    timestamp: new Date().toISOString(),
                });
            }),
        );

        const categories = await client.categories.getAll();
        expect(categories).toEqual(['cat1', 'cat2']);
    });

    it('should fetch platforms from REST API', async () => {
        server.use(
            http.get('https://api.example.com/api/platforms', () => {
                return HttpResponse.json({
                    data: { platforms: ['win', 'linux'] },
                    statusCode: 200,
                    timestamp: new Date().toISOString(),
                });
            }),
        );

        const platforms = await client.platforms.getAll();
        expect(platforms).toEqual(['win', 'linux']);
    });
});
