import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createChanomhubClient } from '../index';
import { server } from './mocks/server';

// This test suite runs against the REAL API
// We explicitly disable MSW for this file
describe('Real API Integration Tests', () => {
    beforeAll(() => {
        // Stop the mock server to let requests go through to the real network
        server.close();
    });

    afterAll(() => {
        // Restart it just in case other tests run after this (though unlikely in this run)
        server.listen();
    });

    const client = createChanomhubClient({
        apiUrl: 'https://api.chanomhub.com',
        // No token needed for public endpoints
    });

    it('should fetch tags from real API', async () => {
        console.log('Fetching tags from https://api.chanomhub.com...');
        const tags = await client.articles.getTags();
        console.log('Tags received:', tags);

        expect(Array.isArray(tags)).toBe(true);
        expect(tags.length).toBeGreaterThan(0);
    });

    it('should fetch platforms from real API', async () => {
        console.log('Fetching platforms...');
        const platforms = await client.articles.getPlatforms();
        console.log('Platforms received:', platforms);

        expect(Array.isArray(platforms)).toBe(true);
        expect(platforms.length).toBeGreaterThan(0);
    });

    it('should fetch a list of articles', async () => {
        console.log('Fetching articles...');
        const result = await client.articles.getAllPaginated({ limit: 5 });
        console.log(`Fetched ${result.items.length} articles. Total: ${result.total}`);

        expect(result.items.length).toBeGreaterThan(0);
        expect(result.items[0]).toHaveProperty('id');
        expect(result.items[0]).toHaveProperty('title');
    });
});
