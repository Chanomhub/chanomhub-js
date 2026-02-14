
import type { ArticleRepository } from './repositories/articleRepository';
import type { ArticleQueryOptions } from './types/article';
import type { ModListOptions } from './types/common';

// This file is just to verify that the types and signatures are correct.
// It is not meant to be executed against a backend.

export async function verifyUsage(repo: ArticleRepository) {
    // 1. getByTag with options
    await repo.getByTag('some-tag', {
        preset: 'minimal',
        fields: ['id', 'title']
    });

    // 2. getBySlug with version and custom fields
    await repo.getBySlug('some-slug', {
        language: 'en',
        version: '1.0',
        fields: ['id', 'title', 'versions', 'downloadLinks']
    });

    // 3. getWithDownloads with custom fields
    // Should support options
    await repo.getWithDownloads('some-slug', {
        fields: ['id', 'downloadLinks', 'officialDownloadSources']
    });

    // 4. getMods with options (excluding creator)
    const modListOptions: ModListOptions = {
        fields: ['id', 'name', 'version', 'downloadLink']
    };
    await repo.getMods(123, modListOptions);

    console.log('Type checks passed!');
}
