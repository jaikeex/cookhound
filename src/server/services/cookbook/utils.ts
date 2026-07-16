import { CookbookDTO, CookbookVisibility, UserRole } from '@/common/types';
import { AuthErrorForbidden, NotFoundError } from '@/server/error';
import { assertAuthenticated } from '@/server/utils/reqwest/guards';
import { serializeToPlain } from '@/server/utils/serialization';
import db from '@/server/db/model';
import type { CookbookFromDb, CookbookVisibilityGroup } from '@/common/types';
import { RequestContext } from '@/server/utils/reqwest/context';

type CookbookVisibilityInfo = Pick<CookbookFromDb, 'ownerId' | 'visibility'>;

/**
 * Whether the current caller may directly read a specific cookbook (by id or
 * display id). Owners and admins see everything; everyone else may read any
 * cookbook that is not private.
 *
 * @param cookbook - The cookbook's owner id and visibility.
 * @returns true if the caller is allowed to view the cookbook.
 */
export function canViewCookbook(cookbook: CookbookVisibilityInfo): boolean {
    const viewerId = RequestContext.getUserId();
    const viewerRole = RequestContext.getUserRole();

    if (viewerRole === UserRole.Admin || viewerId === cookbook.ownerId) {
        return true;
    }

    return cookbook.visibility !== CookbookVisibility.PRIVATE;
}

/**
 * Whether a cookbook should appear in a caller-visible listing of a user's
 * cookbooks. Owners and admins see all of their cookbooks; everyone else sees only
 * public ones.
 *
 * @param cookbook - The cookbook's owner id and visibility.
 * @returns `true` if the cookbook is allowed to appear in the listing.
 */
export function canListCookbook(cookbook: CookbookVisibilityInfo): boolean {
    const viewerId = RequestContext.getUserId();
    const viewerRole = RequestContext.getUserRole();

    if (viewerRole === UserRole.Admin || viewerId === cookbook.ownerId) {
        return true;
    }

    return cookbook.visibility === CookbookVisibility.PUBLIC;
}

export async function verifyCookbookOwnership(
    cookbookId: number
): Promise<ReturnType<typeof db.cookbook.getOneById>> {
    const userId = assertAuthenticated();
    const cookbook = await db.cookbook.getOneById(cookbookId);

    if (!cookbook) {
        throw new NotFoundError();
    }

    if (cookbook?.ownerId !== userId) {
        throw new AuthErrorForbidden();
    }

    return cookbook;
}

export function getCookbookDataPermissionGroups(
    ownerId: number
): CookbookVisibilityGroup[] {
    const viewerId = RequestContext.getUserId();
    const viewerRole = RequestContext.getUserRole();

    return viewerRole === UserRole.Admin
        ? ['admin']
        : viewerId === ownerId
          ? ['self']
          : [];
}

export function createCookbookDTO(cookbook: CookbookFromDb): CookbookDTO {
    const accessGroups = getCookbookDataPermissionGroups(cookbook.ownerId);

    const normalized = {
        ...cookbook,
        createdAt: cookbook.createdAt?.toISOString(),
        updatedAt: cookbook.updatedAt?.toISOString()
    };

    return serializeToPlain(CookbookDTO, normalized, accessGroups);
}
