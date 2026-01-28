
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
        // Metadata fields
        tags: ['Hentai', 'Visual Novel'],
        categories: ['Game'],
        platforms: ['Windows', 'Android'],
        creator: 'Awesome Studio', // Creator / Studio name
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

        console.log('Fetching full article details (what you get on web page load)...');
        const fullArticle = await client.articles.getBySlug(created.slug);

        if (fullArticle) {
            console.log('Full Article Data:');
            console.log('- Title:', fullArticle.title);
            console.log('- Tags:', fullArticle.tags);
            console.log('- Categories:', fullArticle.categories);
            console.log('- Platforms:', fullArticle.platforms);
            console.log('- Creators:', fullArticle.creators);
            console.log('- Engine:', fullArticle.engine);
            console.log('- Author:', fullArticle.author);
        } else {
            console.error('Failed to fetch full article');
        }

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
