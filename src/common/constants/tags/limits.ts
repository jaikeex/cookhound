export const RECIPE_TAG_CATEGORY_LIMITS_BY_ID = {
    1: 1,
    2: 2,
    3: 2,
    4: 2,
    5: 5,
    6: 3
} as const;

export const RECIPE_TAG_CATEGORY_LIMITS_BY_NAME = {
    cuisine: 1,
    difficulty: 2,
    season: 2,
    definedBy: 2,
    type: 5,
    diet: 3
} as const;

export type RecipeTagCategoryLimitMap = typeof RECIPE_TAG_CATEGORY_LIMITS_BY_ID;

export const MAX_TAGS = 10;
