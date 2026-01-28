import { describe, it, expect } from 'vitest';
import { resolveImageUrl, transformImageUrlsDeep, getFallbackUrl } from '../transforms/imageUrl';

const CDN_URL = 'https://cdn.chanomhub.com/cdn-cgi/image/format=auto';
const STORAGE_URL = 'https://cdn.chanomhub.com';

describe('resolveImageUrl', () => {
    it('should return null for null input', () => {
        expect(resolveImageUrl(null, CDN_URL)).toBeNull();
    });

    it('should return null for undefined input', () => {
        expect(resolveImageUrl(undefined, CDN_URL)).toBeNull();
    });

    it('should return full URL as-is for http URLs', () => {
        const url = 'http://example.com/image.jpg';
        expect(resolveImageUrl(url, CDN_URL)).toBe(url);
    });

    it('should return full URL as-is for https URLs', () => {
        const url = 'https://example.com/image.jpg';
        expect(resolveImageUrl(url, CDN_URL)).toBe(url);
    });

    it('should prepend CDN URL for filename only', () => {
        expect(resolveImageUrl('abc.jpg', CDN_URL)).toBe(`${CDN_URL}/abc.jpg`);
    });

    it('should handle filenames with paths', () => {
        expect(resolveImageUrl('uploads/abc.jpg', CDN_URL)).toBe(
            `${CDN_URL}/uploads/abc.jpg`,
        );
    });
});

describe('transformImageUrlsDeep', () => {
    it('should return null/undefined as-is', () => {
        expect(transformImageUrlsDeep(null, CDN_URL)).toBeNull();
        expect(transformImageUrlsDeep(undefined, CDN_URL)).toBeUndefined();
    });

    it('should transform known image fields', () => {
        const data = {
            mainImage: 'main.jpg',
            coverImage: 'cover.jpg',
            backgroundImage: 'bg.jpg',
            image: 'profile.jpg',
            title: 'Test Article',
        };

        const result = transformImageUrlsDeep(data, CDN_URL);

        expect(result.mainImage).toBe(`${CDN_URL}/main.jpg`);
        expect(result.coverImage).toBe(`${CDN_URL}/cover.jpg`);
        expect(result.backgroundImage).toBe(`${CDN_URL}/bg.jpg`);
        expect(result.image).toBe(`${CDN_URL}/profile.jpg`);
        expect(result.title).toBe('Test Article'); // Non-image field unchanged
    });

    it('should not transform already full URLs', () => {
        const data = {
            mainImage: 'https://existing.com/image.jpg',
        };

        const result = transformImageUrlsDeep(data, CDN_URL);
        expect(result.mainImage).toBe('https://existing.com/image.jpg');
    });

    it('should transform images array with url property', () => {
        const data = {
            images: [{ url: 'image1.jpg' }, { url: 'image2.jpg' }],
        };

        const result = transformImageUrlsDeep(data, CDN_URL);

        expect(result.images[0].url).toBe(`${CDN_URL}/image1.jpg`);
        expect(result.images[1].url).toBe(`${CDN_URL}/image2.jpg`);
    });

    it('should recursively transform nested objects', () => {
        const data = {
            article: {
                mainImage: 'article.jpg',
                author: {
                    image: 'author.jpg',
                },
            },
        };

        const result = transformImageUrlsDeep(data, CDN_URL);

        expect(result.article.mainImage).toBe(`${CDN_URL}/article.jpg`);
        expect(result.article.author.image).toBe(`${CDN_URL}/author.jpg`);
    });

    it('should handle arrays at root level', () => {
        const data = [{ mainImage: 'img1.jpg' }, { mainImage: 'img2.jpg' }];

        const result = transformImageUrlsDeep(data, CDN_URL);

        expect(result[0].mainImage).toBe(`${CDN_URL}/img1.jpg`);
        expect(result[1].mainImage).toBe(`${CDN_URL}/img2.jpg`);
    });
});

describe('getFallbackUrl', () => {
    it('should return null for null/undefined input', () => {
        expect(getFallbackUrl(null, CDN_URL)).toBeNull();
        expect(getFallbackUrl(undefined, CDN_URL)).toBeNull();
    });

    it('should return filename as-is if just filename', () => {
        expect(getFallbackUrl('abc.jpg', CDN_URL)).toBe('abc.jpg');
    });

    it('should strip CDN URL from full URL', () => {
        const fullUrl = `${CDN_URL}/abc.jpg`;
        expect(getFallbackUrl(fullUrl, CDN_URL)).toBe('abc.jpg');
    });

    it('should handle optional storageUrl', () => {
        const fullUrl = `${CDN_URL}/abc.jpg`;
        expect(getFallbackUrl(fullUrl, CDN_URL, STORAGE_URL)).toBe(`${STORAGE_URL}/abc.jpg`);
    });

    it('should return other external URLs as-is', () => {
        const url = 'https://other-cdn.com/image.jpg';
        expect(getFallbackUrl(url, CDN_URL, STORAGE_URL)).toBe(url);
    });

    it('should prepend storageUrl to filename if provided', () => {
        expect(getFallbackUrl('abc.jpg', CDN_URL, STORAGE_URL)).toBe(`${STORAGE_URL}/abc.jpg`);
    });
});
