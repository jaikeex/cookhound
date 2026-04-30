import type { Prisma } from '@/server/db/generated/prisma/client';
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
        authType: true,
        email: true,
        avatarUrl: true,
        role: true,
        status: true,
        createdAt: true,
        lastLogin: true,
        lastVisitedAt: true,
        emailVerified: true,
        passwordHash: true,
        deletedAt: true,
        deletionScheduledFor: true,
        preferences: {
            select: {
                settings: true
            }
        },
        cookieConsent: {
            where: { revokedAt: null },
            orderBy: { createdAt: 'desc' },
            take: 1
        },
        termsAcceptance: {
            where: { revokedAt: null },
            orderBy: { createdAt: 'desc' },
            take: 1
        }
    },
    admin: {
        id: true,
        username: true,
        authType: true,
        email: true,
        avatarUrl: true,
        role: true,
        status: true,
        createdAt: true,
        lastLogin: true,
        lastVisitedAt: true,
        passwordHash: true,
        deletedAt: true,
        deletionScheduledFor: true,
        preferences: {
            select: {
                settings: true
            }
        },
        cookieConsent: {
            where: { revokedAt: null },
            orderBy: { createdAt: 'desc' },
            take: 1
        },
        termsAcceptance: {
            where: { revokedAt: null },
            orderBy: { createdAt: 'desc' },
            take: 1
        }
    }
};

export function getUserSelect(groups: UserVisibilityGroup[]): UserSelect {
    if (groups.includes('admin')) return USER_SELECT.admin;
    if (groups.includes('self')) return USER_SELECT.self;
    return USER_SELECT.public;
}

//|---------------------------------------------------------------------------------------------|//
//?                                ADMIN MANAGEMENT PROJECTIONS                                 ?//
///
//# These projections feed the admin user-management screens (list + detail). They expose
//# moderation-relevant fields (emailVerified, deletion timestamps, content counts) and are
//# distinct from USER_SELECT.admin, which is the shape used when an admin reads their own
//# account-level data.
//|---------------------------------------------------------------------------------------------|//

export const ADMIN_USER_LIST_SELECT = {
    id: true,
    username: true,
    email: true,
    authType: true,
    role: true,
    status: true,
    emailVerified: true,
    avatarUrl: true,
    createdAt: true,
    lastLogin: true,
    lastVisitedAt: true,
    _count: { select: { recipes: true } }
} satisfies UserSelect;

export const ADMIN_USER_DETAIL_SELECT = {
    id: true,
    username: true,
    email: true,
    authType: true,
    role: true,
    status: true,
    emailVerified: true,
    avatarUrl: true,
    createdAt: true,
    updatedAt: true,
    lastLogin: true,
    lastVisitedAt: true,
    lastPasswordReset: true,
    deletedAt: true,
    deletionScheduledFor: true,
    _count: {
        select: {
            recipes: true,
            ratings: true,
            flags: true
        }
    }
} satisfies UserSelect;
