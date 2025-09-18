import { NextResponse } from 'next/server';
import { type UserRole } from '@/common/types';
import { ENV_CONFIG_PUBLIC } from '@/common/constants';
import { MiddlewareError } from '@/server/error';
import { type ServerSession } from './manager';
import { verifySessionFromCookie } from './verify-server';

interface RouteConfig {
    path: string;
    roles: UserRole[] | null;
}

export const PROTECTED_ROUTES: RouteConfig[] = [
    { path: '/recipe/create', roles: [] },
    { path: '/shopping-list', roles: [] },
    { path: '/user/change-email', roles: [] },
    { path: '/auth/login', roles: null },
    { path: '/auth/register', roles: null },
    { path: '/auth/verify-email', roles: null }
];

export const PROTECTED_ROUTES_LIST = PROTECTED_ROUTES.map(
    (route) => route.path
);

//~=============================================================================================~//
//$                                       HELPER FUNCTIONS                                      $//
//~=============================================================================================~//

function getRouteConfig(pathname: string) {
    for (const route of PROTECTED_ROUTES) {
        if (pathname.startsWith(route.path)) {
            return route;
        }
    }
    return null;
}

function redirectToRoot() {
    throw new MiddlewareError(
        'Already logged in',
        NextResponse.redirect(new URL('/', ENV_CONFIG_PUBLIC.ORIGIN))
    );
}

function redirectToRestricted() {
    throw new MiddlewareError(
        'Unauthorized',
        NextResponse.redirect(
            new URL(`/error/restricted`, ENV_CONFIG_PUBLIC.ORIGIN)
        )
    );
}

function redirectToRestrictedWithLogin(pathname: string) {
    const params = new URLSearchParams();
    params.set('anonymous', 'true');
    params.set('target', pathname);

    throw new MiddlewareError(
        'Unauthorized',
        NextResponse.redirect(
            new URL(
                `/error/restricted?${params.toString()}`,
                ENV_CONFIG_PUBLIC.ORIGIN
            )
        )
    );
}

function assertValidRouteConfig(
    route: RouteConfig
): asserts route is RouteConfig {
    if (!route.path) {
        throw new MiddlewareError(
            'RouteConfig.path is missing',
            NextResponse.next()
        );
    }
    if (route.roles !== null && !Array.isArray(route.roles)) {
        throw new MiddlewareError(
            'RouteConfig.roles must be an array or null',
            NextResponse.next()
        );
    }
}

//~=============================================================================================~//
//$                                     MIDDLEWARE FUNCTION                                     $//
//~=============================================================================================~//

/**
 * Verifies the user's access to the requested route from the client side.
 *
 *!This is a middleware function. It should not be called from any other context.
 *
 * @param request - The request object.
 * @returns promise that resolves to a NextResponse object or null.
 *
 * @throws MiddlewareError (redirect to '/error/restricted') If some of the checks fail.
 * @returns null if the checks pass.
 */
export const verifyRouteAccess: MiddlewareStepFunction = async (request) => {
    const { pathname } = request.nextUrl;

    /**
     * If the route config object is not found for this route, then it is not protected.
     * Nothing else to see here.
     */
    const routeConfig = getRouteConfig(pathname);
    if (!routeConfig) return null;

    assertValidRouteConfig(routeConfig);

    const requiresAuth = routeConfig.roles !== null;
    const requiresRoleTest =
        requiresAuth && routeConfig.roles && routeConfig.roles.length > 0;

    //?------------------------------------
    // From now on, the route is protected.
    //?------------------------------------

    let isLoggedIn: boolean;
    let session: ServerSession | null;

    try {
        const result = await verifySessionFromCookie();

        isLoggedIn = result.isLoggedIn;
        session = result.session;
    } catch (error: unknown) {
        return redirectToRestrictedWithLogin(pathname);
    }

    // User is trying to access a protected route without a session.
    // If the route is for bros only, kick them out.
    if ((!isLoggedIn || !session) && requiresAuth) {
        return redirectToRestrictedWithLogin(pathname);
    }

    // If the route is for guests only, let them in.
    if ((!isLoggedIn || !session) && !requiresAuth) {
        return null;
    }

    //?--------------------------------------------------------------------------------
    // From now on, the route is protected and the user is logged in and authenticated.
    //?--------------------------------------------------------------------------------

    if (!requiresAuth) {
        /**
         * Null value here means that the route is for guests only. the user is authenticated here
         * so they are sent to root.
         */
        return redirectToRoot();
    }

    if (
        session &&
        requiresRoleTest &&
        !routeConfig.roles?.includes(session.userRole as UserRole)
    ) {
        /**
         * The route IS protected AND the role permissions are set.
         * However, the user is not cool enough to continue...
         */
        return redirectToRestricted();
    }

    // Getting here means the user passed all the checks. Congratulations!
    return null;
};
