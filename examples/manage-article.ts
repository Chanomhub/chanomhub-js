
import { createChanomhubClient } from '../index';
import type { NewArticleDTO } from '../types/article';

async function main() {
    // NOTE: This requires a valid token to work
    const token = process.env.CHANOMHUB_TOKEN;
    if (!token) {
        console.error('Please set CHANOMHUB_TOKEN env var');
        process.exit(1);
    }

    const client = createChanomhubClient({ token });

    const newArticle: NewArticleDTO = {
        title: 'Test Article SDK',
        slug: 'test-article-sdk-' + Date.now(),
        description: 'Test description',
        body: 'Test body content',
        language: 'en',
        ver: '1.0.0',
        status: 'DRAFT',
        engine: 'RENPY',
        tags: ['test'],
        categories: ['game'],
        platforms: ['windows'],
        creator: 'Test Studio',
    };

    try {
        console.log('Creating article...');
        const created = await client.articles.create(newArticle);
        console.log('Created article:', JSON.stringify(created, null, 2));

        console.log('Updating article...');
        const updated = await client.articles.update(created.slug, {
            description: 'Updated description',
        });
        console.log('Updated article:', JSON.stringify(updated, null, 2));

        console.log('Deleting article...');
        await client.articles.delete(created.slug);
        console.log('Deleted article');

    } catch (error) {
        console.error('Error:', error);
    }
}

if (require.main === module) {
    main();
}
