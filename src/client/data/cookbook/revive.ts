import type { Cookbook, CookbookDTO } from '@/common/types';

const toDate = (value: string | null | undefined): Date | undefined => {
    if (value === null || value === undefined) return undefined;
    return new Date(value);
};

/**
 * Convert a `CookbookDTO` (timestamps as JSON strings) into a runtime
 * `Cookbook` with real `Date` instances. `createdAt` / `updatedAt` are
 * gated by group-scoped `@Expose` on the server, so absent values
 * propagate as `undefined` — callers should treat the dates as optional.
 */
export const reviveCookbookDates = (dto: CookbookDTO): Cookbook => ({
    ...dto,
    createdAt: toDate(dto.createdAt),
    updatedAt: toDate(dto.updatedAt)
});
