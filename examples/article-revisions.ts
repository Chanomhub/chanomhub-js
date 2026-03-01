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

    try {
        console.log('--- Creating Draft Article ---');
        const newArticle: NewArticleDTO = {
            title: 'Revision Test Article',
            slug: 'rev-test-' + Date.now(),
            description: 'Version 1 Description',
            body: 'Version 1 Body',
            language: 'en',
            status: 'DRAFT',
        };
        const article = await client.articles.create(newArticle);
        console.log(`Created article: ${article.slug} [Status: ${article.status}]`);

        console.log('\n--- Updating Article (Version 2) ---');
        const updated1 = await client.articles.update(article.slug, {
            description: 'Version 2 Description',
            body: 'Version 2 Body',
        });
        console.log(`Updated article to version 2 [Status: ${updated1.status}]`);

        console.log('\n--- Updating Article (Version 3) ---');
        await client.articles.update(article.slug, {
            description: 'Version 3 Description',
            body: 'Version 3 Body',
        });
        console.log('Updated article to version 3');

        console.log('\n--- Fetching Revisions ---');
        const revisions = await client.articles.getRevisions(article.slug);
        console.log(`Found ${revisions.total} revisions`);

        if (revisions.total === 0) {
            console.log(
                'Note: No revisions found. This is expected for DRAFT articles or unapproved updates.',
            );
            console.log('Skipping comparison and restore tests.');
        } else {
            revisions.items.forEach((rev) => {
                console.log(`- v${rev.version} by ${rev.author.name} at ${rev.createdAt}`);
            });

            if (revisions.items.length >= 2) {
                console.log('\n--- Comparing Versions (v1 vs v3) ---');
                // Assuming revisions are ordered latest first, so v3 is index 0, v1 is index 2?
                // Actually version is explicit number
                const diff = await client.articles.compareVersions(article.slug, 1, 3);
                console.log('Diff Stats:', JSON.stringify(diff.stats, null, 2));
                console.log('Description Diff:', diff.descriptionDiff);
            }

            console.log('\n--- Restoring Version 1 ---');
            const restored = await client.articles.restoreRevision(article.slug, 1);
            console.log('Restored to version 1. New version:', restored.version);
        }

        console.log('\n--- Cleaning Up ---');
        await client.articles.delete(article.slug);
        console.log('Deleted article');
    } catch (error) {
        console.error('Error:', error);
    }
}

if (require.main === module) {
    main();
}
