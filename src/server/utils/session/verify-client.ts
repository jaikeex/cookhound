import { NextResponse } from 'next/server';
import { UserRole } from '@/common/types';
import { ENV_CONFIG_PUBLIC, SESSION_COOKIE_NAME } from '@/common/constants';
import { MiddlewareError } from '@/server/error';
import { type ServerSession } from './manager';
import { redisClient } from '@/server/integrations/redis';

//§—————————————————————————————————————————————————————————————————————————————————————————————§//
//§                                           NOT USED                                          §//
///
//# The middleware and by extension this function as well are currently not in active use.
//# This code is left here for reference, because i would love to structure future middleware
//# code the same as this.
///
//§—————————————————————————————————————————————————————————————————————————————————————————————§//
//§                                         CLIENT ONLY                                         §//
///
//# These functions should only be used on the client side and in the middleware.
//#
//# Using them on the server is inefficient and unnecessary, since the server can use all the
//# necessary tools directly. The same can't be done in the middleware, since node.js packages
//# can't be imported for some reason. The jwt verification must use node:crypto, so that path
//# is closed.
//#
//? NOTE to me: Apparently the support fore node in next middleware is now in the canary
//? stage of development. (2025-06-16)
///
//§—————————————————————————————————————————————————————————————————————————————————————————————§//

interface RouteConfig {
    path: string;
    roles: UserRole[] | null;
}

export const PROTECTED_ROUTES: RouteConfig[] = [
    { path: '/recipe/create', roles: [UserRole.User, UserRole.Admin] },
    { path: '/shopping-list', roles: [UserRole.User, UserRole.Admin] },
    { path: '/auth/login', roles: null },
    { path: '/auth/register', roles: null },
    { path: '/auth/google', roles: null },
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

    //?------------------------------------
    // From now on, the route is protected.
    //?------------------------------------

    const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    // User is trying to access a protected route without a session.
    // If the route is for bros only, kick them out.
    if (!sessionId && routeConfig.roles !== null) {
        return redirectToRestrictedWithLogin(pathname);
    }

    // If the route is for guests only, let them in.
    if (!sessionId && routeConfig.roles === null) {
        return null;
    }

    let session: ServerSession | null;

    try {
        session = await redisClient.get<ServerSession>(sessionId);
    } catch (error: unknown) {
        /**
         * If the getCurrentUser() call fails, the session is not valid (or something else, who cares).
         * That's the same as trying to access a protected route without a sesssion token so GTFO.
         */
        return redirectToRestrictedWithLogin(pathname);
    }

    //?--------------------------------------------------------------------------------
    // From now on, the route is protected and the user is logged in and authenticated.
    //?--------------------------------------------------------------------------------

    if (routeConfig.roles === null) {
        /**
         * Null value here means that the route is for guests only. the user is authenticated here
         * so they are sent to root.
         */
        return redirectToRoot();
    }

    if (
        session &&
        routeConfig.roles &&
        !routeConfig.roles.includes(session.userRole as UserRole)
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
