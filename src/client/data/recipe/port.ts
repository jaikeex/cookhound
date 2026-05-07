import type {
    Locale,
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
 *
 * The query layer (`src/client/data/recipe/query/client.ts`) depends
 * only on this interface — never on a concrete HTTP client. The HTTP
 * implementation lives in `src/client/data/recipe/adapters/adapter.ts`;
 * tests can substitute a fake implementation via `DataProvider`.
 *
 * Conventions:
 * - All methods take a single object payload (no positional args). This keeps
 *   the contract stable and lets `useAppMutation(repo.method, opts)` work
 *   without inline wrappers.
 * - Read methods accept an optional `signal` so react-query can cancel
 *   in-flight requests on unmount or query-key change.
 * - Methods return domain types (`Recipe`), not transport DTOs. Date revival
 *   and any other DTO→domain mapping happens inside the adapter.
 * - Errors are thrown as `RequestError` (`src/client/error/request.ts`).
 */
export interface RecipeRepository {
    getById(args: { id: string; signal?: AbortSignal }): Promise<Recipe>;

    getByDisplayId(args: {
        displayId: string;
        signal?: AbortSignal;
    }): Promise<Recipe>;

    list(args: {
        language: Locale;
        batch: number;
        perPage: number;
        signal?: AbortSignal;
    }): Promise<RecipeForDisplayDTO[]>;

    search(args: {
        query: string;
        language: Locale;
        batch: number;
        perPage: number;
        signal?: AbortSignal;
    }): Promise<RecipeForDisplayDTO[]>;

    listByUser(args: {
        userId: string;
        language: Locale;
        batch: number;
        perPage: number;
        signal?: AbortSignal;
    }): Promise<RecipeForDisplayDTO[]>;

    searchByUser(args: {
        userId: string;
        query: string;
        language: Locale;
        batch: number;
        perPage: number;
        signal?: AbortSignal;
    }): Promise<RecipeForDisplayDTO[]>;

    filter(args: {
        language: Locale;
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

    registerVisit(args: { id: string; userId: string | null }): Promise<void>;

    submitAppeal(
        args: { recipeId: number } & RecipeFlagAppealPayload
    ): Promise<RecipeFlagAppealDTO>;
}
