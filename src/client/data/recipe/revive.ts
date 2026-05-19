import type { Recipe, RecipeDTO } from '@/common/types';

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
