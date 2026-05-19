import type { User, UserDTO } from '@/common/types';

const toDate = (value: string | null | undefined): Date | null | undefined => {
    if (value === undefined) return undefined;
    if (value === null) return null;
    return new Date(value);
};

export const reviveUserDates = (dto: UserDTO): User => ({
    ...dto,
    createdAt: toDate(dto.createdAt),
    lastLogin: toDate(dto.lastLogin),
    lastVisitedAt: toDate(dto.lastVisitedAt),
    deletedAt: toDate(dto.deletedAt),
    deletionScheduledFor: toDate(dto.deletionScheduledFor)
});
