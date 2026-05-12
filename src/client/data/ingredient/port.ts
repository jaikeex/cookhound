import type { IngredientDTO, Locale } from '@/common/types';

/**
 * Domain port for ingredient data access.
 */
export interface IngredientRepository {
    list(args: {
        language: Locale;
        signal?: AbortSignal;
    }): Promise<IngredientDTO[]>;
}
