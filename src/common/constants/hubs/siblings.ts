import {
    RECIPE_CATEGORY_TAGS,
    CATEGORY_IDS,
    CS_TAG_CATEGORIES
} from '@/common/constants/tags';
import type { CategoryId } from '@/common/types';
import { HUB_SLUGS, type HubDbSlug } from './slugs';

export type HubSibling = Readonly<{
    hubSlug: string;
    name: string;
}>;

type CategoryKey = keyof typeof RECIPE_CATEGORY_TAGS;

const CATEGORY_KEY_BY_ID: Readonly<Record<number, CategoryKey>> =
    Object.fromEntries(
        (Object.entries(CATEGORY_IDS) as Array<[CategoryKey, number]>).map(
            ([key, id]) => [id, key]
        )
    );

/**
 * Returns the other hubs in the same tag category.
 *
 * Selection is a rotation starting right after the current hub (wrapping
 * around the category), NOT a first-N slice. With a fixed slice, every hub
 * would link to the same first N entries and hubs later in the array would
 * receive zero inbound links, the rotation guarantees each hub is linked
 * from its limit predecessors, so internal link equity reaches the whole
 * category.
 *
 * @param dbSlug - The current hub's db tag slug (excluded from the result)
 * @param categoryId - The current hub's category
 * @param limit - Maximum number of siblings to return
 */
export const getHubSiblings = (
    dbSlug: HubDbSlug,
    categoryId: CategoryId,
    limit = 12
): HubSibling[] => {
    const categoryKey = CATEGORY_KEY_BY_ID[categoryId];

    if (!categoryKey) {
        return [];
    }

    const dbSlugs: readonly string[] = RECIPE_CATEGORY_TAGS[categoryKey];
    const csNames: readonly string[] = CS_TAG_CATEGORIES[categoryKey];

    const total = dbSlugs.length;

    if (total === 0) {
        return [];
    }

    const startIndex = (dbSlugs.indexOf(dbSlug) + 1 + total) % total;

    const siblings: HubSibling[] = [];
    const seen = new Set<string>();

    for (let step = 0; step < total && siblings.length < limit; step++) {
        const index = (startIndex + step) % total;
        const siblingSlug = dbSlugs[index];

        if (!siblingSlug) {
            continue;
        }

        const name = csNames[index];
        const hubSlug = HUB_SLUGS[siblingSlug as HubDbSlug];

        if (siblingSlug === dbSlug || !name || !hubSlug || seen.has(hubSlug)) {
            continue;
        }

        seen.add(hubSlug);
        siblings.push({ hubSlug, name });
    }

    return siblings;
};
