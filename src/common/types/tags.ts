import type { RECIPE_CATEGORY_TAGS } from '@/common/constants';

export type RecipeTagCategory = keyof typeof RECIPE_CATEGORY_TAGS;

export type RecipeTag =
    (typeof RECIPE_CATEGORY_TAGS)[keyof typeof RECIPE_CATEGORY_TAGS][number];

export type TagListDTO = {
    category: RecipeTagCategory;
    tags: RecipeTagDTO[];
};

export type RecipeTagDTO = {
    id: number;
    name: string;
    categoryId: number;
};
