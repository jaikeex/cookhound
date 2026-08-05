import type { Recipe, User, Cookbook } from '@/common/types';
import {
    CATEGORY_IDS,
    ROUTES,
    RECIPE_CATEGORY_TAGS,
    CS_TAG_CATEGORIES,
    resolveTagHub,
    buildHubTitle,
    HUB_UI,
    HUB_INDEX_UI
} from '@/common/constants';
import { t } from '@/client/locales';

//?—————————————————————————————————————————————————————————————————————————————————————————————?//
//?                                     RICH RESULTS SCHEMA                                     ?//
///
//# Schemas tells search engines what exactly the content is about.
//# In short, the schema generation turns the domain object (Recipe, Cookbook, User, etc.) into
//# a standards-compliant json-ld so every page advertises its meaning to the crawlers.
//# That makes the page eligible for all of google's recipe related rich features.
//#
//# For more info in case i forget (which will probably be tomorrow) here are some links:
//# https://schema.org
//# https://schema.org/Recipe
//# https://developers.google.com/search/docs/appearance/structured-data/recipe
///
//?—————————————————————————————————————————————————————————————————————————————————————————————?//

//# schema.org RestrictedDiet enum members for the diet tags that have one.
const RESTRICTED_DIET_BY_DB_SLUG: Partial<
    Record<(typeof RECIPE_CATEGORY_TAGS)['diet'][number], string>
> = {
    'gluten-free': 'https://schema.org/GlutenFreeDiet',
    'lactose-free': 'https://schema.org/LowLactoseDiet',
    'vegetarian': 'https://schema.org/VegetarianDiet',
    'vegan': 'https://schema.org/VeganDiet'
};

const RESTRICTED_DIET_BY_TAG_NAME: ReadonlyMap<string, string> = new Map(
    RECIPE_CATEGORY_TAGS.diet.flatMap((dbSlug, index) => {
        const dietUrl = RESTRICTED_DIET_BY_DB_SLUG[dbSlug];
        const csName = CS_TAG_CATEGORIES.diet[index];

        return dietUrl && csName ? [[csName, dietUrl] as const] : [];
    })
);

export function generateRecipeSchema(
    recipe: Recipe,
    baseUrl?: string,
    authorName?: string
) {
    const schema: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'Recipe',
        name: recipe.title
    };

    // Tie the entity to its canonical url.
    if (baseUrl) {
        const canonicalUrl = `${baseUrl}${ROUTES.recipe.detail(recipe.displayId, recipe.title)}`;

        schema['@id'] = `${canonicalUrl}#recipe`;
        schema.url = canonicalUrl;
        schema.mainEntityOfPage = canonicalUrl;
    }

    // image is a REQUIRED property for the recipe rich result. There is no
    // honest fallback, so imageless recipes omit the property entirely.
    if (recipe.imageUrl) {
        schema.image = [recipe.imageUrl];
    }

    if (recipe.createdAt) {
        schema.datePublished = recipe.createdAt;
    }

    if (recipe.updatedAt) {
        schema.dateModified = recipe.updatedAt;
    }

    // Map tags to cuisine/category.
    if (recipe.tags) {
        const cuisineTags = recipe.tags.filter(
            (t) => t.categoryId === CATEGORY_IDS.cuisine
        );
        if (cuisineTags.length > 0) {
            schema.recipeCuisine = cuisineTags.map((t) => t.name);
        }

        const typeTags = recipe.tags.filter(
            (t) => t.categoryId === CATEGORY_IDS.type
        );
        if (typeTags.length > 0) {
            schema.recipeCategory = typeTags.map((t) => t.name);
        }

        const dietUrls = recipe.tags
            .filter((t) => t.categoryId === CATEGORY_IDS.diet)
            .map((t) => RESTRICTED_DIET_BY_TAG_NAME.get(t.name))
            .filter((url): url is string => Boolean(url));

        if (dietUrls.length > 0) {
            schema.suitableForDiet = dietUrls;
        }
    }

    // A Person without a name causes a "missing field" warning.
    if (recipe.authorId && baseUrl) {
        schema.author = {
            '@type': 'Person',
            name: authorName || t('meta.recipe.author-fallback'),
            url: `${baseUrl}${ROUTES.user.detail(recipe.authorId)}`
        };
    }

    // Full text on purpose: the 160-char cap belongs to the meta description,
    // json-ld has no length limit and richer text helps the crawler.
    const authoredDescription = recipe.description?.trim();
    const fallbackDescription = recipe.instructions
        ?.find((step) => step?.trim())
        ?.trim();
    const description = authoredDescription || fallbackDescription;

    if (description) {
        schema.description = description;
    }

    if (recipe.time) {
        schema.totalTime = `PT${recipe.time}M`;
    }

    if (recipe.portionSize) {
        // Czech pluralization: 1-4 "porce", 5+ "porcí"
        const yieldKey =
            recipe.portionSize <= 4
                ? 'meta.recipe.yield-few'
                : 'meta.recipe.yield-many';

        // Bare number first, some consumers only parse the numeric form.
        schema.recipeYield = [
            String(recipe.portionSize),
            t(yieldKey, { count: recipe.portionSize })
        ];
    }

    if (recipe.ingredients && recipe.ingredients.length > 0) {
        const ingredientLines = recipe.ingredients
            .map((i) => {
                const amount = i.quantity ? `${i.quantity} ` : '';
                return `${amount}${i.name}`.trim();
            })
            .filter(Boolean);

        if (ingredientLines.length > 0) {
            schema.recipeIngredient = ingredientLines;
        }
    }

    if (recipe.instructions && recipe.instructions.length > 0) {
        const steps = recipe.instructions
            .map((step) => step?.trim())
            .filter((step): step is string => Boolean(step));

        if (steps.length > 0) {
            schema.recipeInstructions = steps.map((text, idx) => ({
                '@type': 'HowToStep',
                position: idx + 1,
                text
            }));
        }
    }

    if (recipe.rating && recipe.rating > 0 && recipe.timesRated) {
        schema.aggregateRating = {
            '@type': 'AggregateRating',
            ratingValue: Math.round(recipe.rating * 10) / 10,
            ratingCount: recipe.timesRated,
            bestRating: 5,
            worstRating: 1
        };
    }

    // Google: keywords must not repeat tags that belong in recipeCategory
    // or recipeCuisine, only the remaining categories go here.
    if (recipe.tags && recipe.tags.length > 0) {
        const keywordTags = recipe.tags.filter(
            (t) =>
                t.categoryId !== CATEGORY_IDS.cuisine &&
                t.categoryId !== CATEGORY_IDS.type
        );

        if (keywordTags.length > 0) {
            schema.keywords = keywordTags.map((t) => t.name).join(', ');
        }
    }

    return schema;
}

//|=============================================================================================|//

export type RecipeHubCrumb = Readonly<{
    name: string;
    path: string;
}>;

/**
 * Resolves the hub page a recipe belongs to (via its first type tag) for use
 * as the middle crumb of the recipe page's BreadcrumbList. Returns null when
 * the recipe has no type tag with a matching hub.
 *
 * Shares `resolveTagHub` with the tag links rendered on the recipe page, so
 * the crumb and those links can never point at different hubs. The title is
 * built here rather than carried on the TagHub, so `HUB_CONTENT` stays out of
 * the client bundles that only need the hub's path (see resolve.ts).
 */
export function resolveRecipeHubCrumb(
    tags: Recipe['tags']
): RecipeHubCrumb | null {
    if (!tags) {
        return null;
    }

    for (const tag of tags) {
        if (tag.categoryId !== CATEGORY_IDS.type) {
            continue;
        }

        const hub = resolveTagHub(tag);

        if (hub) {
            return {
                name: buildHubTitle(hub.dbSlug, hub.name, hub.categoryId),
                path: hub.path
            };
        }
    }

    return null;
}

//|=============================================================================================|//
//?                                    BREADCRUMB TRAILS                                        ?//
///
//# Every page in the tag hub cluster hangs off the same two crumbs - the site root and the hub
//# index at /recepty - so they are built in one place. google renders the breadcrumb rich result
//# straight from this markup, and it is also how a crawler learns that /recepty is the parent of
//# all hubs rather than just another page carrying a lot of links.
///
//|=============================================================================================|//

export type BreadcrumbItem = Readonly<{
    name: string;
    url: string;
}>;

/**
 * The crumbs the hub cluster hangs off: site root, then the hub index.
 */
export function buildHubClusterCrumbs(origin: string): BreadcrumbItem[] {
    return [
        { name: HUB_UI.breadcrumbHome, url: origin },
        { name: HUB_INDEX_UI.title, url: `${origin}${ROUTES.hub.index}` }
    ];
}

/**
 * The full crumb trail for a recipe page.
 *
 * The hub index and the recipe's own hub are included as a pair or not at all:
 * a recipe with no type tag has no hub, and /recepty lists categories rather
 * than recipes, so naming it as the parent of a hubless recipe would claim a
 * path that does not exist.
 *
 * @param recipe - The recipe being rendered.
 * @param origin - The site origin, without a trailing slash.
 */
export function buildRecipeCrumbs(
    recipe: Recipe,
    origin: string
): BreadcrumbItem[] {
    const hubCrumb = resolveRecipeHubCrumb(recipe.tags);

    return [
        { name: HUB_UI.breadcrumbHome, url: origin },
        ...(hubCrumb
            ? [
                  {
                      name: HUB_INDEX_UI.title,
                      url: `${origin}${ROUTES.hub.index}`
                  },
                  { name: hubCrumb.name, url: `${origin}${hubCrumb.path}` }
              ]
            : []),
        {
            name: recipe.title,
            url: `${origin}${ROUTES.recipe.detail(recipe.displayId, recipe.title)}`
        }
    ];
}

//|=============================================================================================|//

export function generatePersonSchema(user: User, baseUrl: string) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: user.username,
        image: user.avatarUrl || `${baseUrl}/img/anonymous.webp`,
        url: `${baseUrl}${ROUTES.user.detail(user.id)}`
    };
}

export function generateBreadcrumbSchema(items: ReadonlyArray<BreadcrumbItem>) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            name: item.name,
            item: item.url
        }))
    };
}

export function generateWebSiteSchema(baseUrl: string) {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Cookhound',
        url: baseUrl,
        description: t('meta.site.description'),
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${baseUrl}${ROUTES.search()}?query={search_term_string}`
            },
            'query-input': 'required name=search_term_string'
        }
    };
}

export function generateOrganizationSchema(baseUrl: string) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Cookhound',
        url: baseUrl,
        logo: `${baseUrl}/img/logo-light.png`
    };
}

/**
 * A page whose purpose is to list other pages (the hub index, for one), as
 * opposed to a page that is itself the content.
 *
 * @param args.mainEntity - The list this page exists to present. Nested rather
 * than emitted as a second top-level node, so a crawler reads the collection
 * and its contents as one statement about one url instead of two unrelated
 * ones. Its @context is stripped: a nested node inherits the enclosing one.
 */
export function generateCollectionPageSchema(args: {
    name: string;
    description: string;
    url: string;
    mainEntity?: Record<string, unknown>;
}) {
    const schema: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        '@id': args.url,
        name: args.name,
        description: args.description,
        url: args.url
    };

    if (args.mainEntity) {
        const nested = { ...args.mainEntity };
        delete nested['@context'];

        schema.mainEntity = nested;
    }

    return schema;
}

export function generateItemListSchema(
    items: Array<{ name: string; url: string; image?: string }>,
    listName: string
) {
    return {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: listName,
        itemListElement: items.map((item, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            name: item.name,
            url: item.url,
            image: item.image
        }))
    };
}

export function generateCookbookSchema(cookbook: Cookbook, baseUrl: string) {
    return {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: cookbook.title,
        description:
            cookbook.description ||
            t('meta.cookbook.description', {
                cookbookTitle: cookbook.title
            }),
        image: cookbook.coverImageUrl,
        url: `${baseUrl}${ROUTES.cookbook.detail(cookbook.displayId)}`,
        dateCreated: cookbook.createdAt?.toISOString(),
        dateModified: (cookbook.updatedAt ?? cookbook.createdAt)?.toISOString()
    };
}

export function serializeSchema(schema: Record<string, unknown>): string {
    return JSON.stringify(schema)
        .replace(/</g, '\\u003c')
        .replace(/>/g, '\\u003e')
        .replace(/&/g, '\\u0026');
}
