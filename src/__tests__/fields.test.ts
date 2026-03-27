import { describe, it, expect } from 'vitest';
import { buildFieldsQuery, FIELD_PRESETS, FIELD_MAPPINGS } from '../utils/fields';

describe('Field Query Utilities', () => {
    describe('FIELD_PRESETS', () => {
        it('should have minimal preset with basic fields', () => {
            expect(FIELD_PRESETS.minimal).toEqual(['id', 'title', 'slug', 'mainImage', 'viewsCount']);
        });

        it('should have standard preset with common fields', () => {
            expect(FIELD_PRESETS.standard).toContain('id');
            expect(FIELD_PRESETS.standard).toContain('title');
            expect(FIELD_PRESETS.standard).toContain('author');
            expect(FIELD_PRESETS.standard).toContain('tags');
            expect(FIELD_PRESETS.standard).toContain('platforms');
            expect(FIELD_PRESETS.standard).toContain('categories');
            expect(FIELD_PRESETS.standard).toContain('engine');
        });

        it('should have full preset with all fields including body', () => {
            expect(FIELD_PRESETS.full).toContain('body');
            expect(FIELD_PRESETS.full).toContain('backgroundImage');
        });
    });

    describe('FIELD_MAPPINGS', () => {
        it('should map simple fields correctly', () => {
            expect(FIELD_MAPPINGS.id).toBe('id');
            expect(FIELD_MAPPINGS.title).toBe('title');
            expect(FIELD_MAPPINGS.slug).toBe('slug');
        });

        it('should map nested fields correctly', () => {
            expect(FIELD_MAPPINGS.author).toContain('author {');
            expect(FIELD_MAPPINGS.author).toContain('name');
            expect(FIELD_MAPPINGS.engine).toContain('engine {');
            expect(FIELD_MAPPINGS.tags).toContain('tags {');
        });
    });

    describe('buildFieldsQuery', () => {
        it('should use standard preset by default', () => {
            const query = buildFieldsQuery();
            expect(query).toContain('id');
            expect(query).toContain('title');
            expect(query).toContain('author {');
        });

        it('should build query with minimal preset', () => {
            const query = buildFieldsQuery({ preset: 'minimal' });
            expect(query).toContain('id');
            expect(query).toContain('title');
            expect(query).toContain('slug');
            expect(query).toContain('mainImage');
            expect(query).not.toContain('description');
        });

        it('should build query with full preset', () => {
            const query = buildFieldsQuery({ preset: 'full' });
            expect(query).toContain('body');
            expect(query).toContain('backgroundImage');
        });

        it('should use custom fields when provided', () => {
            const query = buildFieldsQuery({ fields: ['id', 'title', 'engine'] });
            expect(query).toContain('id');
            expect(query).toContain('title');
            expect(query).toContain('engine {');
            expect(query).not.toContain('slug');
        });

        it('should override preset with custom fields', () => {
            const query = buildFieldsQuery({ preset: 'full', fields: ['id', 'title'] });
            expect(query).toContain('id');
            expect(query).toContain('title');
            expect(query).not.toContain('body');
        });
    });
});
