import type { Status, UserVisibilityGroup } from '@/common/types';
import { UserDTO, UserRole } from '@/common/types';
import type { User as UserFromDB } from '@prisma/client';
import { serializeToPlain } from '@/server/utils/serialization';
import { RequestContext } from '@/server/utils/reqwest/context';

/**
 * Determines the permission groups for the caller to access the user data.
 *
 * @param id - The ID of the user that the caller wants to see.
 * @returns The permission groups.
 */
export function getUserDataPermissionGroups(id: number): UserVisibilityGroup[] {
    const viewerId = RequestContext.getUserId();
    const viewerRole = RequestContext.getUserRole();

    return viewerRole === UserRole.Admin
        ? ['admin']
        : viewerId === id
          ? ['self']
          : [];
}

export function createUserDTO(user: UserFromDB): UserDTO {
    const groups = getUserDataPermissionGroups(user.id);

    const rawPreferences: unknown = (user as any).preferences;
    const flattenedPreferences =
        rawPreferences &&
        typeof rawPreferences === 'object' &&
        'settings' in rawPreferences
            ? ((rawPreferences as { settings: unknown }).settings ?? {})
            : (rawPreferences ?? {});

    const normalized = {
        ...user,
        preferences: flattenedPreferences,
        role: user.role as UserRole,
        status: user.status as Status,
        createdAt: user.createdAt?.toISOString() ?? '',
        lastLogin: user.lastLogin?.toISOString() ?? null,
        lastVisitedAt: user.lastVisitedAt?.toISOString() ?? null
    };

    return serializeToPlain(UserDTO, normalized, groups) as UserDTO;
}
