import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Go up one level from scripts/ to project root
const docsDir = path.join(__dirname, '..', 'docs');

function cleanTitle(title) {
    // Remove escaped angle brackets and backslashes for cleaner YAML
    return title
        .replace(/\\</g, '<')
        .replace(/\\>/g, '>')
        .replace(/<[^>]+>/g, '') // Remove generic type parameters like <T>
        .replace(/\\/g, '') // Remove remaining backslashes
        .trim();
}

function extractTitle(content) {
    // Extract title from first # heading
    const match = content.match(/^#\s+(.+)$/m);
    if (match) {
        return cleanTitle(match[1]);
    }
    return 'API Reference';
}

function extractDescription(content) {
    // Try to find a description after the title
    const lines = content.split('\n');
    let foundTitle = false;

    for (const line of lines) {
        if (line.startsWith('# ')) {
            foundTitle = true;
            continue;
        }
        if (
            foundTitle &&
            line.trim() &&
            !line.startsWith('#') &&
            !line.startsWith('|') &&
            !line.startsWith('***') &&
            !line.startsWith('Defined in:')
        ) {
            // Clean and limit description length
            const desc = line.trim().replace(/"/g, '\\"').slice(0, 160);
            return desc;
        }
    }
    return '';
}

function escapeYamlString(str) {
    // Escape special YAML characters in double-quoted strings
    return str
        .replace(/\\/g, '\\\\') // Escape backslashes first
        .replace(/"/g, '\\"'); // Escape double quotes
}

function addFrontmatter(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Skip if already has frontmatter
    if (content.startsWith('---')) {
        return;
    }

    const title = extractTitle(content);
    const description = extractDescription(content);

    // Remove the # title line since it will be in frontmatter
    let newContent = content.replace(/^#\s+.+\n+/, '');

    // Rule 3.2: Remove .mdx extension from internal links
    // Matches [Label](path/to/file.mdx) -> [Label](path/to/file)
    newContent = newContent.replace(/\[([^\]]+)\]\(([^)]+)\.mdx\)/g, '[$1]($2)');

    // Build frontmatter
    const frontmatter = ['---', `title: "${escapeYamlString(title)}"`];

    if (description) {
        frontmatter.push(`description: "${escapeYamlString(description)}"`);
    }

    frontmatter.push('---', '', '');

    newContent = frontmatter.join('\n') + newContent;

    fs.writeFileSync(filePath, newContent);
    console.log(`✓ ${path.relative(docsDir, filePath)}`);
}

function processDirectory(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            processDirectory(fullPath);
        } else if (entry.name.endsWith('.mdx')) {
            addFrontmatter(fullPath);
        }
    }
}

console.log('Adding Starlight frontmatter to MDX files...\n');
processDirectory(docsDir);
console.log('\n✅ Done!');
