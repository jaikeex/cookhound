import { describe, it, expect } from 'vitest';
import {
    RECIPE_CATEGORY_TAGS,
    CATEGORY_IDS,
    CS_TAG_CATEGORIES
} from '@/common/constants/tags';
import type { RecipeTagCategory } from '@/common/types';
import {
    resolveTagHub,
    buildHubIndexGroups,
    HUB_CATEGORY_GROUPS,
    ALL_HUB_INDEX_GROUPS
} from './resolve';
import { HUB_SLUGS, resolveHubSlug, buildHubPath } from './slugs';

//|=============================================================================================|//
//?                                        FIXTURES                                              ?//
//|=============================================================================================|//

const CATEGORY_KEYS = Object.keys(RECIPE_CATEGORY_TAGS) as RecipeTagCategory[];

/**
 * Every (categoryId, czech name) pair the seed can write into Tag.name, built
 * the same way prisma/seed.ts builds it: index-aligned with the db slugs.
 */
const SEEDED_TAGS = CATEGORY_KEYS.flatMap((categoryKey) => {
    const dbSlugs: readonly string[] = RECIPE_CATEGORY_TAGS[categoryKey];
    const csNames: readonly string[] = CS_TAG_CATEGORIES[categoryKey];

    return dbSlugs.map((dbSlug, index) => ({
        categoryKey,
        categoryId: CATEGORY_IDS[categoryKey],
        dbSlug,
        name: csNames[index] as string
    }));
});

//|=============================================================================================|//

describe('resolveTagHub', () => {
    it('resolves every seeded tag to its hub', () => {
        const unresolved = SEEDED_TAGS.filter(
            (tag) =>
                resolveTagHub({
                    name: tag.name,
                    categoryId: tag.categoryId
                }) === null
        );

        expect(unresolved).toEqual([]);
    });

    it('resolves to the hub of the tag it was built from', () => {
        for (const tag of SEEDED_TAGS) {
            const hub = resolveTagHub({
                name: tag.name,
                categoryId: tag.categoryId
            });

            expect(hub?.dbSlug).toBe(tag.dbSlug);
            expect(hub?.hubSlug).toBe(
                HUB_SLUGS[tag.dbSlug as keyof typeof HUB_SLUGS]
            );
            expect(hub?.path).toBe(buildHubPath(hub?.hubSlug ?? '', 1));
        }
    });

    it('resolves hub slugs that round-trip back to the db slug', () => {
        for (const tag of SEEDED_TAGS) {
            const hub = resolveTagHub({
                name: tag.name,
                categoryId: tag.categoryId
            });

            expect(resolveHubSlug(hub?.hubSlug ?? '')).toBe(tag.dbSlug);
        }
    });

    it('resolves the two-category bread tag under either category', () => {
        const asDefinedBy = resolveTagHub({
            name: 'chléb',
            categoryId: CATEGORY_IDS.definedBy
        });
        const asType = resolveTagHub({
            name: 'chléb',
            categoryId: CATEGORY_IDS.type
        });

        expect(asDefinedBy?.hubSlug).toBe(HUB_SLUGS.bread);
        expect(asType?.hubSlug).toBe(HUB_SLUGS.bread);
    });

    it('returns null for an unknown name or a mismatched category', () => {
        expect(
            resolveTagHub({
                name: 'neexistuje',
                categoryId: CATEGORY_IDS.type
            })
        ).toBeNull();

        // 'polévka' is a type tag, not a cuisine one.
        expect(
            resolveTagHub({
                name: 'polévka',
                categoryId: CATEGORY_IDS.cuisine
            })
        ).toBeNull();
    });
});

//|=============================================================================================|//

describe('HUB_CATEGORY_GROUPS', () => {
    it('lists every hub exactly once', () => {
        const hubSlugs = HUB_CATEGORY_GROUPS.flatMap((group) =>
            group.hubs.map((hub) => hub.hubSlug)
        );

        const expectedCount = new Set(Object.values(HUB_SLUGS)).size;

        expect(hubSlugs).toHaveLength(expectedCount);
        expect(new Set(hubSlugs).size).toBe(expectedCount);
    });

    it('covers every tag category', () => {
        expect(HUB_CATEGORY_GROUPS.map((group) => group.categoryKey)).toEqual(
            CATEGORY_KEYS
        );

        for (const group of HUB_CATEGORY_GROUPS) {
            expect(group.hubs.length).toBeGreaterThan(0);
        }
    });

    it('lists the bread hub under type only', () => {
        const groupsWithBread = HUB_CATEGORY_GROUPS.filter((group) =>
            group.hubs.some((hub) => hub.hubSlug === HUB_SLUGS.bread)
        );

        expect(groupsWithBread).toHaveLength(1);
        expect(groupsWithBread[0]?.categoryKey).toBe('type');
    });

    it('groups hubs under their own category', () => {
        for (const group of HUB_CATEGORY_GROUPS) {
            for (const hub of group.hubs) {
                expect(hub.categoryId).toBe(group.categoryId);
            }
        }
    });
});

//|=============================================================================================|//

describe('buildHubIndexGroups', () => {
    const counts = (
        entries: Array<[string, number]>
    ): ReadonlyMap<string, number> => new Map(entries);

    it('lists only the hubs it was given counts for', () => {
        const groups = buildHubIndexGroups(
            counts([
                ['soup', 9],
                ['dessert', 4]
            ])
        );

        expect(
            groups.flatMap((group) => group.hubs.map((hub) => hub.dbSlug))
        ).toEqual(['soup', 'dessert']);
    });

    it('drops categories left with no listed hubs', () => {
        const groups = buildHubIndexGroups(counts([['italian', 3]]));

        expect(groups).toHaveLength(1);
        expect(groups[0]?.categoryKey).toBe('cuisine');
    });

    it('orders hubs by recipe count, highest first', () => {
        const groups = buildHubIndexGroups(
            counts([
                ['soup', 2],
                ['dessert', 40],
                ['salad', 11]
            ])
        );

        expect(groups[0]?.hubs.map((hub) => hub.recipeCount)).toEqual([
            40, 11, 2
        ]);
    });

    it('breaks count ties on the czech name so the render is stable', () => {
        const groups = buildHubIndexGroups(
            counts([
                ['soup', 5],
                ['dessert', 5],
                ['salad', 5]
            ])
        );

        expect(groups[0]?.hubs.map((hub) => hub.name)).toEqual([
            'dezert',
            'polévka',
            'salát'
        ]);
    });

    it('carries the hub path through unchanged', () => {
        const [group] = buildHubIndexGroups(counts([['dessert', 7]]));
        const [hub] = group?.hubs ?? [];

        expect(hub?.path).toBe(buildHubPath(HUB_SLUGS.dessert, 1));
        expect(hub?.recipeCount).toBe(7);
    });

    it('ignores counts for slugs with no hub', () => {
        expect(buildHubIndexGroups(counts([['neexistuje', 12]]))).toEqual([]);
    });

    it('returns nothing when no hub qualifies', () => {
        expect(buildHubIndexGroups(counts([]))).toEqual([]);
    });
});

//|=============================================================================================|//

describe('ALL_HUB_INDEX_GROUPS', () => {
    it('lists every hub the grouped constant does, countless', () => {
        const fallbackSlugs = ALL_HUB_INDEX_GROUPS.flatMap((group) =>
            group.hubs.map((hub) => hub.hubSlug)
        );
        const groupedSlugs = HUB_CATEGORY_GROUPS.flatMap((group) =>
            group.hubs.map((hub) => hub.hubSlug)
        );

        expect(new Set(fallbackSlugs)).toEqual(new Set(groupedSlugs));

        for (const group of ALL_HUB_INDEX_GROUPS) {
            for (const hub of group.hubs) {
                expect(hub.recipeCount).toBeNull();
            }
        }
    });

    it('orders each category alphabetically', () => {
        for (const group of ALL_HUB_INDEX_GROUPS) {
            const names = group.hubs.map((hub) => hub.name);

            expect(names).toEqual(
                [...names].sort((a, b) => a.localeCompare(b, 'cs'))
            );
        }
    });
});
