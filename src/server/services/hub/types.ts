import type { HubDbSlug } from '@/common/constants';
import type { RecipeTagDTO } from '@/common/types';

export type HubData = Readonly<{
    dbSlug: HubDbSlug;
    tag: RecipeTagDTO;
    recipeCount: number;
    pageCount: number;
}>;
