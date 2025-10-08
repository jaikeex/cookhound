import type { Recipe, RecipeDTO } from '@/common/types';

export const reviveRecipeDates = (dto: RecipeDTO): Recipe => ({
    ...dto,
    createdAt: dto.createdAt ? new Date(dto.createdAt) : new Date(),
    updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : new Date()
});
