import type { User, UserDTO } from '@/common/types';

const toDate = (value: string | null | undefined): Date | null | undefined => {
    if (value === undefined) return undefined;
    if (value === null) return null;
    return new Date(value);
};

/**
 * Convert a `UserDTO` (timestamps as JSON strings) into a runtime `User`
 * with real `Date` instances. Optional fields (gated by group-scoped
 * `@Expose` on the server) propagate as `undefined` so callers can
 * distinguish "field withheld" from "field explicitly null".
 */
export const reviveUserDates = (dto: UserDTO): User => ({
    ...dto,
    createdAt: toDate(dto.createdAt),
    lastLogin: toDate(dto.lastLogin),
    lastVisitedAt: toDate(dto.lastVisitedAt),
    deletedAt: toDate(dto.deletedAt),
    deletionScheduledFor: toDate(dto.deletionScheduledFor)
});
