import { describe, it, expect } from 'vitest';
import { resolveImageUrl, transformImageUrlsDeep, getFallbackUrl } from '../transforms/imageUrl';

const CDN_URL = 'https://imgproxy.chanomhub.com';
const STORAGE_URL = 'https://cdn.chanomhub.com';

// Helper to build expected imgproxy URL
const buildImgproxyUrl = (filename: string) => {
    const sourceUrl = `${STORAGE_URL}/${filename}`;
    const encodedUrl = encodeURIComponent(sourceUrl);
    return `${CDN_URL}/insecure/plain/${encodedUrl}@webp`;
};

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

    it('should create imgproxy URL for filename only', () => {
        const result = resolveImageUrl('abc.jpg', CDN_URL);
        expect(result).toBe(buildImgproxyUrl('abc.jpg'));
    });

    it('should handle filenames with paths', () => {
        const result = resolveImageUrl('uploads/abc.jpg', CDN_URL);
        expect(result).toBe(buildImgproxyUrl('uploads/abc.jpg'));
    });

    it('should allow custom storage URL', () => {
        const customStorage = 'https://custom-storage.com';
        const result = resolveImageUrl('abc.jpg', CDN_URL, customStorage);
        const sourceUrl = `${customStorage}/abc.jpg`;
        const encodedUrl = encodeURIComponent(sourceUrl);
        expect(result).toBe(`${CDN_URL}/insecure/plain/${encodedUrl}@webp`);
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

        expect(result.mainImage).toBe(buildImgproxyUrl('main.jpg'));
        expect(result.coverImage).toBe(buildImgproxyUrl('cover.jpg'));
        expect(result.backgroundImage).toBe(buildImgproxyUrl('bg.jpg'));
        expect(result.image).toBe(buildImgproxyUrl('profile.jpg'));
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

        expect(result.images[0].url).toBe(buildImgproxyUrl('image1.jpg'));
        expect(result.images[1].url).toBe(buildImgproxyUrl('image2.jpg'));
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

        expect(result.article.mainImage).toBe(buildImgproxyUrl('article.jpg'));
        expect(result.article.author.image).toBe(buildImgproxyUrl('author.jpg'));
    });

    it('should handle arrays at root level', () => {
        const data = [{ mainImage: 'img1.jpg' }, { mainImage: 'img2.jpg' }];

        const result = transformImageUrlsDeep(data, CDN_URL);

        expect(result[0].mainImage).toBe(buildImgproxyUrl('img1.jpg'));
        expect(result[1].mainImage).toBe(buildImgproxyUrl('img2.jpg'));
    });
});

describe('getFallbackUrl', () => {
    it('should return null for null/undefined input', () => {
        expect(getFallbackUrl(null, CDN_URL)).toBeNull();
        expect(getFallbackUrl(undefined, CDN_URL)).toBeNull();
    });

    it('should return storage URL for filename', () => {
        expect(getFallbackUrl('abc.jpg', CDN_URL)).toBe(`${STORAGE_URL}/abc.jpg`);
    });

    it('should extract source URL from imgproxy URL', () => {
        // Build an imgproxy URL and verify we can extract the original
        const imgproxyUrl = buildImgproxyUrl('abc.jpg');
        expect(getFallbackUrl(imgproxyUrl, CDN_URL)).toBe(`${STORAGE_URL}/abc.jpg`);
    });

    it('should handle imgproxy URL with path', () => {
        const imgproxyUrl = buildImgproxyUrl('uploads/abc.jpg');
        expect(getFallbackUrl(imgproxyUrl, CDN_URL)).toBe(`${STORAGE_URL}/uploads/abc.jpg`);
    });

    it('should return other external URLs as-is', () => {
        const url = 'https://other-cdn.com/image.jpg';
        expect(getFallbackUrl(url, CDN_URL)).toBe(url);
    });

    it('should use custom storage URL for filename', () => {
        const customStorage = 'https://custom-storage.com';
        expect(getFallbackUrl('abc.jpg', CDN_URL, customStorage)).toBe(`${customStorage}/abc.jpg`);
    });
});
