import { describe, it, expect } from 'vitest';
import {
    buildHubClusterCrumbs,
    buildRecipeCrumbs,
    generateCollectionPageSchema,
    generateItemListSchema,
    generateRecipeSchema,
    resolveRecipeHubCrumb,
    serializeSchema
} from './schema';
import type { Recipe, RecipeTagDTO } from '@/common/types';
import {
    CATEGORY_IDS,
    ROUTES,
    HUB_SLUGS,
    HUB_UI,
    HUB_INDEX_UI,
    buildHubTitle,
    buildHubPath
} from '@/common/constants';

//|=============================================================================================|//
//?                                        FIXTURES                                             ?//
//|=============================================================================================|//

const BASE_URL = 'https://cookhound.cz';

/**
 * Tag names must match the czech display names the seed writes from
 * CS_TAG_CATEGORIES — the diet and hub lookups in schema.ts are keyed by them.
 */
const TAGS: RecipeTagDTO[] = [
    { id: 1, name: 'italská', categoryId: CATEGORY_IDS.cuisine },
    { id: 2, name: 'polévka', categoryId: CATEGORY_IDS.type },
    { id: 3, name: 'bez lepku', categoryId: CATEGORY_IDS.diet },
    { id: 4, name: 'bez cukru', categoryId: CATEGORY_IDS.diet },
    { id: 5, name: 'snadné', categoryId: CATEGORY_IDS.difficulty }
];

const buildRecipe = (overrides: Partial<Recipe> = {}): Recipe => ({
    id: 1,
    displayId: '12345678',
    title: 'Testovací polévka',
    authorId: 42,
    time: 90,
    portionSize: 4,
    ingredients: [
        { id: 1, name: 'mrkev', quantity: '200 g' },
        { id: 2, name: 'sůl', quantity: null }
    ],
    instructions: ['Nakrájejte mrkev.', 'Vařte 20 minut.'],
    description: 'Popis receptu.',
    notes: null,
    imageUrl: 'https://storage.example.com/image.jpg',
    rating: 4.5,
    flags: null,
    timesRated: 3,
    timesViewed: 10,
    tags: TAGS,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-02-01T00:00:00.000Z'),
    ...overrides
});

const CANONICAL_URL = `${BASE_URL}${ROUTES.recipe.detail('12345678', 'Testovací polévka')}`;

//|=============================================================================================|//
//?                                          TESTS                                              ?//
//|=============================================================================================|//

describe('generateRecipeSchema', () => {
    it('emits the full schema for a fully populated recipe', () => {
        const schema = generateRecipeSchema(buildRecipe(), BASE_URL, 'Kuba');

        expect(schema).toEqual({
            '@context': 'https://schema.org',
            '@type': 'Recipe',
            '@id': `${CANONICAL_URL}#recipe`,
            url: CANONICAL_URL,
            mainEntityOfPage: CANONICAL_URL,
            name: 'Testovací polévka',
            image: ['https://storage.example.com/image.jpg'],
            datePublished: new Date('2026-01-01T00:00:00.000Z'),
            dateModified: new Date('2026-02-01T00:00:00.000Z'),
            recipeCuisine: ['italská'],
            recipeCategory: ['polévka'],
            suitableForDiet: ['https://schema.org/GlutenFreeDiet'],
            author: {
                '@type': 'Person',
                name: 'Kuba',
                url: `${BASE_URL}${ROUTES.user.detail(42)}`
            },
            description: 'Popis receptu.',
            totalTime: 'PT90M',
            recipeYield: ['4', '4 porce'],
            recipeIngredient: ['200 g mrkev', 'sůl'],
            recipeInstructions: [
                {
                    '@type': 'HowToStep',
                    position: 1,
                    text: 'Nakrájejte mrkev.'
                },
                { '@type': 'HowToStep', position: 2, text: 'Vařte 20 minut.' }
            ],
            aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: 4.5,
                ratingCount: 3,
                bestRating: 5,
                worstRating: 1
            },
            keywords: 'bez lepku, bez cukru, snadné'
        });
    });

    it('omits the image property entirely when the recipe has no image', () => {
        const schema = generateRecipeSchema(
            buildRecipe({ imageUrl: '' }),
            BASE_URL
        );

        expect(schema).not.toHaveProperty('image');
    });

    it('falls back to a placeholder author name instead of a nameless Person', () => {
        const schema = generateRecipeSchema(buildRecipe(), BASE_URL, undefined);

        expect(schema.author).toEqual({
            '@type': 'Person',
            name: 'Cookhound Uživatel',
            url: `${BASE_URL}${ROUTES.user.detail(42)}`
        });
    });

    it('omits author and canonical linking without a base url', () => {
        const schema = generateRecipeSchema(buildRecipe());

        expect(schema).not.toHaveProperty('author');
        expect(schema).not.toHaveProperty('@id');
        expect(schema).not.toHaveProperty('url');
        expect(schema).not.toHaveProperty('mainEntityOfPage');
    });

    it('does not truncate a long description', () => {
        const longDescription = 'Dlouhý popis receptu. '.repeat(20).trim();
        const schema = generateRecipeSchema(
            buildRecipe({ description: longDescription }),
            BASE_URL
        );

        expect(schema.description).toBe(longDescription);
    });

    it('falls back to the first non-empty instruction as description', () => {
        const schema = generateRecipeSchema(
            buildRecipe({
                description: null,
                instructions: ['', '   ', 'První skutečný krok.']
            }),
            BASE_URL
        );

        expect(schema.description).toBe('První skutečný krok.');
    });

    it('filters empty instruction steps and renumbers positions', () => {
        const schema = generateRecipeSchema(
            buildRecipe({
                instructions: ['', 'Krok jedna.', '   ', 'Krok dva.']
            }),
            BASE_URL
        );

        expect(schema.recipeInstructions).toEqual([
            { '@type': 'HowToStep', position: 1, text: 'Krok jedna.' },
            { '@type': 'HowToStep', position: 2, text: 'Krok dva.' }
        ]);
    });

    it('uses the many-form yield for 5+ portions', () => {
        const schema = generateRecipeSchema(
            buildRecipe({ portionSize: 6 }),
            BASE_URL
        );

        expect(schema.recipeYield).toEqual(['6', '6 porcí']);
    });

    it('rounds the aggregate rating value to one decimal', () => {
        const schema = generateRecipeSchema(
            buildRecipe({ rating: 3.6666666666666665 }),
            BASE_URL
        );

        expect(schema.aggregateRating).toMatchObject({ ratingValue: 3.7 });
    });

    it('omits aggregateRating for unrated recipes', () => {
        const unrated = generateRecipeSchema(
            buildRecipe({ rating: null, timesRated: 0 }),
            BASE_URL
        );
        const zeroCount = generateRecipeSchema(
            buildRecipe({ rating: 4, timesRated: 0 }),
            BASE_URL
        );

        expect(unrated).not.toHaveProperty('aggregateRating');
        expect(zeroCount).not.toHaveProperty('aggregateRating');
    });

    it('skips diet tags without a schema.org RestrictedDiet member', () => {
        const schema = generateRecipeSchema(
            buildRecipe({
                tags: [
                    { id: 1, name: 'bez cukru', categoryId: CATEGORY_IDS.diet },
                    { id: 2, name: 'paleo', categoryId: CATEGORY_IDS.diet }
                ]
            }),
            BASE_URL
        );

        expect(schema).not.toHaveProperty('suitableForDiet');
        expect(schema.keywords).toBe('bez cukru, paleo');
    });

    it('omits keywords when all tags belong to cuisine/type', () => {
        const schema = generateRecipeSchema(
            buildRecipe({
                tags: [
                    {
                        id: 1,
                        name: 'italská',
                        categoryId: CATEGORY_IDS.cuisine
                    },
                    { id: 2, name: 'polévka', categoryId: CATEGORY_IDS.type }
                ]
            }),
            BASE_URL
        );

        expect(schema).not.toHaveProperty('keywords');
        expect(schema.recipeCuisine).toEqual(['italská']);
        expect(schema.recipeCategory).toEqual(['polévka']);
    });
});

//|=============================================================================================|//

describe('resolveRecipeHubCrumb', () => {
    it('resolves the hub of the first type tag', () => {
        const crumb = resolveRecipeHubCrumb(TAGS);

        expect(crumb).toEqual({
            name: buildHubTitle('soup', 'polévka', CATEGORY_IDS.type),
            path: buildHubPath(HUB_SLUGS.soup, 1)
        });
    });

    it('returns null for null tags, no type tags, or unknown type names', () => {
        expect(resolveRecipeHubCrumb(null)).toBeNull();
        expect(
            resolveRecipeHubCrumb([
                { id: 1, name: 'italská', categoryId: CATEGORY_IDS.cuisine }
            ])
        ).toBeNull();
        expect(
            resolveRecipeHubCrumb([
                { id: 1, name: 'neexistuje', categoryId: CATEGORY_IDS.type }
            ])
        ).toBeNull();
    });
});

//|=============================================================================================|//

describe('buildHubClusterCrumbs', () => {
    it('puts the hub index between the site root and whatever follows', () => {
        expect(buildHubClusterCrumbs(BASE_URL)).toEqual([
            { name: HUB_UI.breadcrumbHome, url: BASE_URL },
            {
                name: HUB_INDEX_UI.title,
                url: `${BASE_URL}${ROUTES.hub.index}`
            }
        ]);
    });
});

//|=============================================================================================|//

describe('buildRecipeCrumbs', () => {
    it('runs root -> hub index -> hub -> recipe for a recipe with a type tag', () => {
        expect(buildRecipeCrumbs(buildRecipe(), BASE_URL)).toEqual([
            { name: HUB_UI.breadcrumbHome, url: BASE_URL },
            {
                name: HUB_INDEX_UI.title,
                url: `${BASE_URL}${ROUTES.hub.index}`
            },
            {
                name: buildHubTitle('soup', 'polévka', CATEGORY_IDS.type),
                url: `${BASE_URL}${buildHubPath(HUB_SLUGS.soup, 1)}`
            },
            { name: 'Testovací polévka', url: CANONICAL_URL }
        ]);
    });

    it('omits the hub index along with the hub when the recipe has neither', () => {
        // /recepty lists categories, not recipes - naming it as the parent of a
        // hubless recipe would claim a path that does not exist.
        const crumbs = buildRecipeCrumbs(
            buildRecipe({
                tags: [
                    { id: 1, name: 'italská', categoryId: CATEGORY_IDS.cuisine }
                ]
            }),
            BASE_URL
        );

        expect(crumbs).toEqual([
            { name: HUB_UI.breadcrumbHome, url: BASE_URL },
            { name: 'Testovací polévka', url: CANONICAL_URL }
        ]);
    });
});

//|=============================================================================================|//

describe('generateCollectionPageSchema', () => {
    const COLLECTION = {
        name: 'Recepty podle kategorií',
        description: 'Všechny kategorie receptů na jednom místě.',
        url: `${BASE_URL}${ROUTES.hub.index}`
    };

    it('identifies itself by url without claiming to be its own main entity', () => {
        const schema = generateCollectionPageSchema(COLLECTION);

        expect(schema).toEqual({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            '@id': COLLECTION.url,
            name: COLLECTION.name,
            description: COLLECTION.description,
            url: COLLECTION.url
        });

        // mainEntityOfPage points from a Thing to the page about it, so a
        // WebPage naming its own url states nothing.
        expect(schema).not.toHaveProperty('mainEntityOfPage');
    });

    it('omits mainEntity entirely when there is no list to nest', () => {
        expect(
            generateCollectionPageSchema({
                ...COLLECTION,
                mainEntity: undefined
            })
        ).not.toHaveProperty('mainEntity');
    });

    it('nests the item list and drops its redundant @context', () => {
        const itemList = generateItemListSchema(
            [
                {
                    name: 'Polévky',
                    url: `${BASE_URL}${buildHubPath(HUB_SLUGS.soup, 1)}`
                }
            ],
            COLLECTION.name
        );

        const schema = generateCollectionPageSchema({
            ...COLLECTION,
            mainEntity: itemList
        });

        expect(schema.mainEntity).toEqual({
            '@type': 'ItemList',
            name: COLLECTION.name,
            itemListElement: [
                {
                    '@type': 'ListItem',
                    position: 1,
                    name: 'Polévky',
                    url: `${BASE_URL}${buildHubPath(HUB_SLUGS.soup, 1)}`,
                    image: undefined
                }
            ]
        });

        // A nested node inherits the enclosing context, and the caller's
        // standalone list object must not be mutated on its way in.
        expect(schema.mainEntity).not.toHaveProperty('@context');
        expect(itemList['@context']).toBe('https://schema.org');
    });
});

//|=============================================================================================|//

describe('serializeSchema', () => {
    it('escapes html-significant characters against script injection', () => {
        const serialized = serializeSchema({
            name: '</script><script>alert(1)</script> & more'
        });

        expect(serialized).not.toContain('<');
        expect(serialized).not.toContain('>');
        expect(serialized).not.toContain('&');
        expect(JSON.parse(serialized)).toEqual({
            name: '</script><script>alert(1)</script> & more'
        });
    });
});
