import { ROUTES } from '@/common/constants/routes';
import type { RECIPE_CATEGORY_TAGS } from '@/common/constants/tags';

//?—————————————————————————————————————————————————————————————————————————————————————————————?//
//?                                      TAG HUB URL SLUGS                                      ?//
///
//# Maps every database tag slug (english, from RECIPE_CATEGORY_TAGS - the seed source) to the
//# url slug of its hub page at /recepty/<slug>.
//#
//# These are PERMANENT urls. Once a hub page has been indexed, changing its slug requires a
//# redirect - so treat edits to existing entries as breaking changes. Adding entries for new
//# tags is always safe.
//#
//# Rules used to derive the slugs:
//# - ascii-folded lowercase czech tag names, dashes for spaces (dezert -> dezerty)
//# - plural where that matches how people search (polevky, dorty, salaty)
//# - cuisine tags suffixed with -kuchyne (italska-kuchyne) to disambiguate and match queries
//#
//# Note: 'bread' exists in two category lists but is a single row in the db (the seed upserts
//# by slug), so it maps to exactly one hub like every other tag.
///
//?—————————————————————————————————————————————————————————————————————————————————————————————?//

type CategoryTagArrays = typeof RECIPE_CATEGORY_TAGS;

/** Union of every database tag slug ('american' | 'italian' | ... ). */
export type HubDbSlug = CategoryTagArrays[keyof CategoryTagArrays][number];

/**
 * db tag slug -> czech hub url slug. `satisfies Record<HubDbSlug, string>`
 * makes a missing entry for any seeded tag a compile-time error.
 */
export const HUB_SLUGS = {
    // cuisine
    'american': 'americka-kuchyne',
    'italian': 'italska-kuchyne',
    'french': 'francouzska-kuchyne',
    'chinese': 'cinska-kuchyne',
    'mexican': 'mexicka-kuchyne',
    'indian': 'indicka-kuchyne',
    'greek': 'recka-kuchyne',
    'japanese': 'japonska-kuchyne',
    'mediterranean': 'stredomorska-kuchyne',
    'thai': 'thajska-kuchyne',
    'spanish': 'spanelska-kuchyne',
    'german': 'nemecka-kuchyne',
    'korean': 'korejska-kuchyne',
    'middle-eastern': 'blizkovychodni-kuchyne',
    'scandinavian': 'skandinavska-kuchyne',
    'vietnamese': 'vietnamska-kuchyne',
    'british': 'britska-kuchyne',
    'arabian': 'arabska-kuchyne',
    'czech': 'ceska-kuchyne',
    'european': 'evropska-kuchyne',
    'south-american': 'jihoamericka-kuchyne',
    'polish': 'polska-kuchyne',
    'austrian': 'rakouska-kuchyne',
    'slovakian': 'slovenska-kuchyne',

    // difficulty
    'very-easy': 'velmi-snadne',
    'easy': 'snadne',
    'hard': 'narocne',
    'time-consuming': 'casove-narocne',
    'quick-prep': 'rychla-priprava',
    'few-ingredients': 'z-mala-surovin',
    'beginner-friendly': 'pro-zacatecniky',
    'advanced': 'pro-pokrocile',

    // season
    'spring': 'jarni',
    'summer': 'letni',
    'autumn': 'podzimni',
    'winter': 'zimni',
    'holiday': 'svatecni',
    'christmas': 'vanocni',
    'easter': 'velikonocni',

    // definedBy
    'beef': 'hovezi',
    'chicken': 'kureci',
    'pork': 'veprove',
    'turkey': 'kruti',
    'lamb': 'jehneci',
    'fish': 'ryby',
    'seafood': 'morske-plody',
    'eggs': 'vejce',
    'milk-and-cream': 'mleko-a-smetana',
    'cheese': 'syr',
    'beans': 'lusteniny',
    'root-vegetables': 'korenova-zelenina',
    'mushrooms': 'houby',
    'fruit': 'ovoce',
    'nuts': 'orechy',
    'seeds': 'seminka',
    'pasta': 'testoviny',
    'grains': 'obiloviny',
    'rice': 'ryze',
    'tofu': 'tofu',
    'vegetables': 'zelenina',

    // type
    'appetizer': 'predkrmy',
    'soup': 'polevky',
    'salad': 'salaty',
    'sandwich': 'sendvice',
    'wrap': 'wrapy',
    'main-course': 'hlavni-chody',
    'side-dish': 'prilohy',
    'sauce': 'omacky',
    'dressing': 'dresinky',
    'snack': 'svaciny',
    'dessert': 'dezerty',
    'cake': 'dorty',
    'pie': 'kolace',
    'bread': 'chleb',
    'pastry': 'pecivo',
    'pancake': 'palacinky',
    'grill': 'grilovani',
    'roast': 'pecene',
    'baking': 'peceni',
    'frying': 'smazeni',
    'pizza': 'pizza',
    'burger': 'burgery',
    'one-pot': 'z-jednoho-hrnce',
    'pressure-cooker': 'tlakovy-hrnec',
    'healthy': 'zdrave',
    'light-meal': 'lehka-jidla',
    'budget-friendly': 'levna-jidla',
    'picnic': 'piknik',
    'party-food': 'pohosteni',
    'breakfast': 'snidane',
    'dinner': 'vecere',
    'drink': 'napoje',
    'spicy': 'palive',

    // diet
    'gluten-free': 'bez-lepku',
    'lactose-free': 'bez-laktozy',
    'vegetarian': 'vegetarianske',
    'vegan': 'veganske',
    'sugar-free': 'bez-cukru',
    'paleo': 'paleo'
} as const satisfies Record<HubDbSlug, string>;

export type HubUrlSlug = (typeof HUB_SLUGS)[HubDbSlug];

/**
 * Reverse lookup: hub url slug -> db tag slug. Built once at module
 * scope; the mapping is hand-maintained to be collision-free so the
 * reversal cannot silently drop entries.
 */
export const HUB_SLUG_TO_DB_SLUG: Readonly<Record<string, HubDbSlug>> =
    Object.fromEntries(
        (Object.entries(HUB_SLUGS) as Array<[HubDbSlug, string]>).map(
            ([dbSlug, hubSlug]) => [hubSlug, dbSlug]
        )
    );

/**
 * Resolves a /recepty/[hubSlug] url segment to its db tag slug, if any.
 */
export const resolveHubSlug = (hubSlug: string): HubDbSlug | null =>
    Object.hasOwn(HUB_SLUG_TO_DB_SLUG, hubSlug)
        ? (HUB_SLUG_TO_DB_SLUG[hubSlug] ?? null)
        : null;

/**
 * Builds the path for a hub page. Page 1 lives at the bare hub url; pages >= 2
 * live under /strana/<page>.
 */
export const buildHubPath = (hubSlug: string, page: number): string =>
    ROUTES.hub.detail(hubSlug, page);
