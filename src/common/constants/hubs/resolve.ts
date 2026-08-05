import {
    RECIPE_CATEGORY_TAGS,
    CATEGORY_IDS,
    CS_TAG_CATEGORIES
} from '@/common/constants/tags';
import type {
    CategoryId,
    RecipeTagCategory,
    RecipeTagDTO
} from '@/common/types';
import { HUB_SLUGS, buildHubPath, type HubDbSlug } from './slugs';

//?—————————————————————————————————————————————————————————————————————————————————————————————?//
//?                                   TAG -> HUB RESOLUTION                                     ?//
///
//# A recipe carries its tags as { id, name, categoryId } so the english db
//# slug that HUB_SLUGS is keyed by never reaches the client. To turn a recipe tag into a link
//# to its hub, the lookup therefore has to go through the czech display name instead.
//#
//# That is safe (I think...) because CS_TAG_CATEGORIES is the source the seed writes Tag.name,
//# index-aligned with RECIPE_CATEGORY_TAGS per category. The name is paired
//# with categoryId here so a future name collision across two categories cannot silently
//# resolve to the wrong hub.
//#
//!This module is reachable from client components (TagList links recipe tags to their hubs),
//!so it must NOT import from ./content. buildHubTitle closes over HUB_CONTENT - every hub's
//!hand-written czech title and intro - and calling it here would pull all of that prose into
//!the client bundle of every recipe page to compute a field only the server reads. A caller
//!that needs the title has the three arguments buildHubTitle takes right there on the TagHub.
///
//?—————————————————————————————————————————————————————————————————————————————————————————————?//

export type TagHub = Readonly<{
    dbSlug: HubDbSlug;
    hubSlug: string;
    path: string;
    name: string;
    categoryId: CategoryId;
}>;

export type HubCategoryGroup = Readonly<{
    categoryKey: RecipeTagCategory;
    categoryId: CategoryId;
    hubs: readonly TagHub[];
}>;

/**
 * A hub as listed on the /recepty index. recipeCount is null only on the
 * build-time fallback path, where no count query was available.
 */
export type HubIndexEntry = TagHub & Readonly<{ recipeCount: number | null }>;

export type HubIndexGroup = Readonly<{
    categoryKey: RecipeTagCategory;
    categoryId: CategoryId;
    hubs: readonly HubIndexEntry[];
}>;

const CATEGORY_KEYS = Object.keys(RECIPE_CATEGORY_TAGS) as RecipeTagCategory[];

const tagHubKey = (categoryId: CategoryId, name: string): string =>
    `${categoryId}:${name}`;

/**
 * Every hub, in category declaration order. A tag missing either a czech name
 * or a hub slug mapping has no page and is dropped.
 */
const HUB_ENTRIES: readonly TagHub[] = CATEGORY_KEYS.flatMap((categoryKey) => {
    const categoryId: CategoryId = CATEGORY_IDS[categoryKey];
    const dbSlugs: readonly string[] = RECIPE_CATEGORY_TAGS[categoryKey];
    const csNames: readonly string[] = CS_TAG_CATEGORIES[categoryKey];

    return dbSlugs.flatMap((slug, index) => {
        const dbSlug = slug as HubDbSlug;
        const name = csNames[index];
        const hubSlug = HUB_SLUGS[dbSlug];

        if (!name || !hubSlug) {
            return [];
        }

        return [
            {
                dbSlug,
                hubSlug,
                path: buildHubPath(hubSlug, 1),
                name,
                categoryId
            }
        ];
    });
});

const TAG_HUB_BY_CATEGORY_AND_NAME: ReadonlyMap<string, TagHub> = new Map(
    HUB_ENTRIES.map((hub) => [tagHubKey(hub.categoryId, hub.name), hub])
);

/**
 * The category a hub is listed under when it appears in more than one array.
 */
const CATEGORY_BY_HUB_SLUG: ReadonlyMap<string, CategoryId> = new Map(
    HUB_ENTRIES.map((hub) => [hub.hubSlug, hub.categoryId])
);

/**
 * Resolves a recipe's tag to the hub page it belongs to.
 */
export const resolveTagHub = (
    tag: Pick<RecipeTagDTO, 'name' | 'categoryId'>
): TagHub | null =>
    TAG_HUB_BY_CATEGORY_AND_NAME.get(tagHubKey(tag.categoryId, tag.name)) ??
    null;

/**
 * Every hub grouped by category, for the /recepty index. Each hub appears
 * exactly once across all groups (see CATEGORY_BY_HUB_SLUG).
 */
export const HUB_CATEGORY_GROUPS: readonly HubCategoryGroup[] =
    CATEGORY_KEYS.map((categoryKey) => {
        const categoryId: CategoryId = CATEGORY_IDS[categoryKey];

        return {
            categoryKey,
            categoryId,
            hubs: HUB_ENTRIES.filter(
                (hub) =>
                    hub.categoryId === categoryId &&
                    CATEGORY_BY_HUB_SLUG.get(hub.hubSlug) === categoryId
            )
        };
    });

//|=============================================================================================|//
//?                                       INDEX LISTING                                          ?//
///
//# The /recepty index is the only page that links to the whole cluster at once, and it sits in
//# the footer of every page - so how it spends its links is the cluster's main internal link
//# equity decision. Two rules follow from that, both implemented below:
//#
//# 1. Only hubs the crawler is allowed to index get a link. HUB_INDEXABLE_THRESHOLD already
//#    decides that in buildHubMetadata (robots directive) and in the sitemap; listing a hub the
//#    site tells google to ignore spends a link slot on a page that can never rank. The caller
//#    passes the counts it got from the indexable-hub query, and only hubs present are listed.
//#
//# 2. The strongest hubs come first. Link position carries weight, and the count doubles as
//#    unique, changing content - which is what separates a directory page worth indexing from a
//#    flat list of 110 links.
///
//?—————————————————————————————————————————————————————————————————————————————————————————————?//

const byRecipeCountThenName = (a: HubIndexEntry, b: HubIndexEntry): number =>
    (b.recipeCount ?? 0) - (a.recipeCount ?? 0) ||
    a.name.localeCompare(b.name, 'cs');

/**
 * Builds the /recepty listing from a map of db tag slug -> recipe count.
 *
 * Hubs absent from the map are dropped, and a category left with no hubs is
 * dropped with them, so the page never renders an empty section heading.
 *
 * @param recipeCountByDbSlug - Counts for the hubs that should be listed.
 */
export const buildHubIndexGroups = (
    recipeCountByDbSlug: ReadonlyMap<string, number>
): readonly HubIndexGroup[] =>
    HUB_CATEGORY_GROUPS.flatMap((group) => {
        const hubs = group.hubs
            .flatMap((hub) => {
                const recipeCount = recipeCountByDbSlug.get(hub.dbSlug);

                return recipeCount ? [{ ...hub, recipeCount }] : [];
            })
            .sort(byRecipeCountThenName);

        return hubs.length > 0 ? [{ ...group, hubs }] : [];
    });

/**
 * Every hub, countless and unfiltered, alphabetically within its category.
 *
 * Build-time fallback only, for a cold build against an unreachable database:
 * the index ships a useful directory rather than failing the build, at the cost
 * of that build's worth of flat linking. A runtime failure has a prerendered
 * page to fall back on instead and must not use this.
 */
export const ALL_HUB_INDEX_GROUPS: readonly HubIndexGroup[] =
    HUB_CATEGORY_GROUPS.map((group) => ({
        ...group,
        hubs: group.hubs
            .map((hub) => ({ ...hub, recipeCount: null }))
            .sort(byRecipeCountThenName)
    }));
