import type {
    Recipe,
    RecipeFilterParams,
    RecipeForCreatePayload,
    RecipeForDisplayDTO
} from '@/common/types';
import type {
    RecipeFlagAppealDTO,
    RecipeFlagAppealPayload
} from '@/common/types/flags/recipe-flag-appeal';

/**
 * Domain port for recipe data access.
 */
export interface RecipeRepository {
    getById(args: { id: string; signal?: AbortSignal }): Promise<Recipe>;

    getByDisplayId(args: {
        displayId: string;
        signal?: AbortSignal;
    }): Promise<Recipe>;

    list(args: {
        batch: number;
        perPage: number;
        signal?: AbortSignal;
    }): Promise<RecipeForDisplayDTO[]>;

    search(args: {
        query: string;
        batch: number;
        perPage: number;
        signal?: AbortSignal;
    }): Promise<RecipeForDisplayDTO[]>;

    listByUser(args: {
        userId: string;
        batch: number;
        perPage: number;
        signal?: AbortSignal;
    }): Promise<RecipeForDisplayDTO[]>;

    searchByUser(args: {
        userId: string;
        query: string;
        batch: number;
        perPage: number;
        signal?: AbortSignal;
    }): Promise<RecipeForDisplayDTO[]>;

    filter(args: {
        batch: number;
        perPage: number;
        filters: RecipeFilterParams;
        signal?: AbortSignal;
    }): Promise<RecipeForDisplayDTO[]>;

    create(args: { input: RecipeForCreatePayload }): Promise<Recipe>;

    update(args: {
        id: string;
        patch: Partial<RecipeForCreatePayload>;
    }): Promise<Recipe>;

    delete(args: { id: number }): Promise<void>;

    rate(args: { id: string; rating: number }): Promise<void>;

    registerVisit(args: { id: string }): Promise<void>;

    submitAppeal(
        args: { recipeId: number } & RecipeFlagAppealPayload
    ): Promise<RecipeFlagAppealDTO>;
}
