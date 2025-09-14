import type { Prisma } from '@prisma/client';
import type { UserVisibilityGroup } from '@/common/types';

export type UserSelect = Prisma.UserSelect;

export const USER_SELECT: Record<UserVisibilityGroup, UserSelect> = {
    public: {
        id: true,
        username: true,
        avatarUrl: true
    },
    self: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
        lastLogin: true,
        lastVisitedAt: true
    },
    admin: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        role: true,
        status: true,
        createdAt: true,
        lastLogin: true,
        lastVisitedAt: true
    }
};

export function getUserSelect(groups: UserVisibilityGroup[]): UserSelect {
    if (groups.includes('admin')) return USER_SELECT.admin;
    if (groups.includes('self')) return USER_SELECT.self;
    return USER_SELECT.public;
}
