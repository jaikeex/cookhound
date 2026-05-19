import type { Cookbook, CookbookDTO } from '@/common/types';

const toDate = (value: string | null | undefined): Date | undefined => {
    if (value === null || value === undefined) return undefined;
    return new Date(value);
};

export const reviveCookbookDates = (dto: CookbookDTO): Cookbook => ({
    ...dto,
    createdAt: toDate(dto.createdAt),
    updatedAt: toDate(dto.updatedAt)
});
