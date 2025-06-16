import { UserRole } from '@/common/types';

interface RouteConfig {
    path: string;
    roles: UserRole[] | null;
}

export const PROTECTED_ROUTES: RouteConfig[] = [
    { path: '/recipe/create', roles: [UserRole.User, UserRole.Admin] },
    { path: '/auth/login', roles: null }
];

export const PROTECTED_ROUTES_LIST = PROTECTED_ROUTES.map(
    (route) => route.path
);
