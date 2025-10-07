/**
 * Maps the category names to defined translation strings. This is kept here instead of with the locales
 * to provide fast matching to existing titles and for general convenience.
 */
export const CATEGORY_TRANSLATIONS = {
    cuisine: 'app.recipe.tags.category.cuisine',
    difficulty: 'app.recipe.tags.category.difficulty',
    season: 'app.recipe.tags.category.season',
    definedBy: 'app.recipe.tags.category.definedBy',
    type: 'app.recipe.tags.category.type',
    diet: 'app.recipe.tags.category.diet'
} as const satisfies Record<string, string>;

export const CATEGORY_IDS = {
    cuisine: 1,
    difficulty: 2,
    season: 3,
    definedBy: 4,
    type: 5,
    diet: 6
} as const satisfies Record<keyof typeof RECIPE_CATEGORY_TAGS, number>;

export const RECIPE_CATEGORY_TAGS = {
    cuisine: [
        'american',
        'italian',
        'french',
        'chinese',
        'mexican',
        'indian',
        'greek',
        'japanese',
        'mediterranean',
        'thai',
        'spanish',
        'german',
        'korean',
        'middle-eastern',
        'scandinavian',
        'vietnamese',
        'british',
        'arabian',
        'czech',
        'european',
        'south-american',
        'polish',
        'austrian',
        'slovakian'
    ],
    difficulty: [
        'very-easy',
        'easy',
        'hard',
        'time-consuming',
        'quick-prep',
        'few-ingredients',
        'beginner-friendly',
        'advanced'
    ],
    season: [
        'spring',
        'summer',
        'autumn',
        'winter',
        'holiday',
        'christmas',
        'easter'
    ],
    definedBy: [
        'beef',
        'chicken',
        'pork',
        'turkey',
        'lamb',
        'fish',
        'seafood',
        'eggs',
        'milk-and-cream',
        'cheese',
        'beans',
        'root-vegetables',
        'mushrooms',
        'fruit',
        'nuts',
        'seeds',
        'pasta',
        'grains',
        'rice',
        'bread',
        'tofu',
        'vegetables'
    ],
    type: [
        'appetizer',
        'soup',
        'salad',
        'sandwich',
        'wrap',
        'main-course',
        'side-dish',
        'sauce',
        'dressing',
        'snack',
        'dessert',
        'cake',
        'pie',
        'bread',
        'pastry',
        'pancake',
        'grill',
        'roast',
        'baking',
        'frying',
        'pizza',
        'burger',
        'one-pot',
        'pressure-cooker',
        'healthy',
        'light-meal',
        'budget-friendly',
        'picnic',
        'party-food',
        'breakfast',
        'dinner',
        'drink',
        'spicy'
    ],
    diet: [
        'gluten-free',
        'lactose-free',
        'vegetarian',
        'vegan',
        'sugar-free',
        'paleo'
    ]
} as const satisfies Record<string, readonly string[]>;
