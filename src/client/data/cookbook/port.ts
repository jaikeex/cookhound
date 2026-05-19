import type { Cookbook, CookbookForCreatePayload } from '@/common/types';

/**
 * Domain port for cookbook operations.
 */
export interface CookbookRepository {
    //~=========================================================================================~//
    //$                                          READS                                          $//
    //~=========================================================================================~//

    getById(args: {
        id: string | number;
        signal?: AbortSignal;
    }): Promise<Cookbook>;

    getByDisplayId(args: {
        displayId: string;
        signal?: AbortSignal;
    }): Promise<Cookbook>;

    listByUser(args: {
        userId: string | number;
        signal?: AbortSignal;
    }): Promise<Cookbook[]>;

    //~=========================================================================================~//
    //$                                        MUTATIONS                                        $//
    //~=========================================================================================~//

    create(args: { input: CookbookForCreatePayload }): Promise<Cookbook>;

    delete(args: { id: number | string }): Promise<void>;

    reorderOwn(args: { orderedCookbookIds: number[] }): Promise<void>;

    addRecipe(args: { cookbookId: number; recipeId: number }): Promise<void>;

    removeRecipe(args: { cookbookId: number; recipeId: number }): Promise<void>;

    reorderRecipes(args: {
        cookbookId: number;
        orderedRecipeIds: number[];
    }): Promise<void>;
}
