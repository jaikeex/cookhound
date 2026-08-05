import { describe, it, expect } from 'vitest';
import { ROUTES } from '@/common/constants/routes';
import {
    HUB_SLUGS,
    HUB_SLUG_TO_DB_SLUG,
    resolveHubSlug,
    buildHubPath
} from './slugs';

//|=============================================================================================|//

describe('buildHubPath', () => {
    it('puts page 1 at the bare hub url', () => {
        expect(buildHubPath('dezerty', 1)).toBe('/recepty/dezerty');
    });

    it('puts later pages under /strana/<page>', () => {
        expect(buildHubPath('dezerty', 2)).toBe('/recepty/dezerty/strana/2');
        expect(buildHubPath('dezerty', 17)).toBe('/recepty/dezerty/strana/17');
    });

    it('treats page 0 and negatives as the first page', () => {
        expect(buildHubPath('dezerty', 0)).toBe('/recepty/dezerty');
        expect(buildHubPath('dezerty', -3)).toBe('/recepty/dezerty');
    });

    it('agrees with ROUTES.hub.detail, which it delegates to', () => {
        for (const page of [1, 2, 9]) {
            expect(buildHubPath('polevky', page)).toBe(
                ROUTES.hub.detail('polevky', page)
            );
        }
    });
});

//|=============================================================================================|//

describe('resolveHubSlug', () => {
    it('reverses every hub slug back to its db slug', () => {
        for (const [dbSlug, hubSlug] of Object.entries(HUB_SLUGS)) {
            expect(resolveHubSlug(hubSlug)).toBe(dbSlug);
        }
    });

    it('reverses without dropping entries', () => {
        expect(Object.keys(HUB_SLUG_TO_DB_SLUG)).toHaveLength(
            Object.keys(HUB_SLUGS).length
        );
    });

    it('returns null for an unknown slug', () => {
        expect(resolveHubSlug('neexistuje')).toBeNull();
    });

    it('returns null for inherited object keys', () => {
        expect(resolveHubSlug('constructor')).toBeNull();
        expect(resolveHubSlug('__proto__')).toBeNull();
    });
});
