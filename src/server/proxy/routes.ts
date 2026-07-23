import { UserRole } from '@/common/types';
import { ROUTES } from '@/common/constants';

/**
 * Route-protection policy for the proxy.
 *
 * Meaning:
 *    null          → guests only.
 *    []            → any authenticated user.
 *    [Role, ...]   → authenticated AND holding one of the listed roles.
 */
export interface RouteConfig {
    path: string;
    roles: UserRole[] | null;
}

export const PROTECTED_ROUTES: RouteConfig[] = [
    { path: ROUTES.admin.root, roles: [UserRole.Admin] },
    { path: ROUTES.recipe.create, roles: [] },
    { path: ROUTES.shoppingList, roles: [] },
    { path: ROUTES.user.changeEmail, roles: [] },
    { path: ROUTES.auth.login, roles: null },
    { path: ROUTES.auth.register, roles: null },
    { path: ROUTES.auth.verifyEmail, roles: null }
];
