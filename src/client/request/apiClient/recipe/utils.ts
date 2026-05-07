import type { Recipe, RecipeDTO } from '@/common/types';

/**
 * Convert a `RecipeDTO` (timestamps as JSON strings, the shape produced by
 * `apiRequestWrapper`) into a runtime `Recipe` (with real `Date`
 * instances). Throws if the backend omitted either timestamp — that is a
 * contract violation and should fail loudly rather than be silently
 * substituted with the current time.
 */
export const reviveRecipeDates = (dto: RecipeDTO): Recipe => {
    if (!dto.createdAt || !dto.updatedAt) {
        throw new Error(
            'reviveRecipeDates: recipe DTO is missing createdAt/updatedAt'
        );
    }
    return {
        ...dto,
        createdAt: new Date(dto.createdAt),
        updatedAt: new Date(dto.updatedAt)
    };
};
