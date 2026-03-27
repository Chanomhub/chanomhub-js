import { describe, it, expect } from 'vitest';
import { resolveDownloadUrl, transformDownloadUrlsDeep } from '../transforms/downloadUrl';

const STORAGE_URL = 'https://storage.chanomhub.com';

describe('resolveDownloadUrl', () => {
    it('should return null for null/undefined', () => {
        expect(resolveDownloadUrl(null, STORAGE_URL)).toBeNull();
        expect(resolveDownloadUrl(undefined, STORAGE_URL)).toBeNull();
    });

    it('should return full URLs as-is', () => {
        const url = 'https://example.com/file.zip';
        expect(resolveDownloadUrl(url, STORAGE_URL)).toBe(url);
    });

    it('should resolve relative storage paths', () => {
        const path = 'public/lustbound-impact-HJ458/file.tar.xz';
        const result = resolveDownloadUrl(path, STORAGE_URL);
        expect(result).toBe(`${STORAGE_URL}/${path}`);
    });

    it('should handle leading slashes in paths', () => {
        const path = '/public/file.zip';
        const result = resolveDownloadUrl(path, STORAGE_URL);
        expect(result).toBe(`${STORAGE_URL}${path}`);
    });

    it('should handle trailing slashes in base URL', () => {
        const path = 'public/file.zip';
        const result = resolveDownloadUrl(path, `${STORAGE_URL}/`);
        expect(result).toBe(`${STORAGE_URL}/${path}`);
    });
});

describe('transformDownloadUrlsDeep', () => {
    it('should transform url fields in objects', () => {
        const data = {
            id: 1,
            downloads: [
                {
                    id: '1598',
                    name: '[Win] Storage',
                    url: 'public/file.tar.xz',
                    isActive: true,
                    vipOnly: false
                }
            ]
        };

        const result = transformDownloadUrlsDeep(data, STORAGE_URL);
        expect(result.downloads[0].url).toBe(`${STORAGE_URL}/public/file.tar.xz`);
    });

    it('should not transform http/https urls', () => {
        const data = {
            url: 'https://example.com/external.zip'
        };
        const result = transformDownloadUrlsDeep(data, STORAGE_URL);
        expect(result.url).toBe('https://example.com/external.zip');
    });
});
