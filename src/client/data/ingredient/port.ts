import type { IngredientDTO } from '@/common/types';

/**
 * Domain port for ingredient data access.
 */
export interface IngredientRepository {
    list(args: { signal?: AbortSignal }): Promise<IngredientDTO[]>;
}
