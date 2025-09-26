import { CookbookDTO, UserRole } from '@/common/types';
import { AuthErrorForbidden, NotFoundError } from '@/server/error';
import { assertAuthenticated } from '@/server/utils/reqwest/guards';
import { serializeToPlain } from '@/server/utils/serialization';
import db from '@/server/db/model';
import type { CookbookFromDb, CookbookVisibilityGroup } from '@/common/types';
import { RequestContext } from '@/server/utils/reqwest/context';

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

    return serializeToPlain(CookbookDTO, cookbook, accessGroups);
}
