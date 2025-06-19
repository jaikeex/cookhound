import { NextResponse } from 'next/server';
import type { UserDTO, UserRole } from '@/common/types';
import apiClient from '@/client/request';
import {
    ENV_CONFIG_PUBLIC,
    JWT_COOKIE_NAME,
    PROTECTED_ROUTES
} from '@/common/constants';
import { MiddlewareError } from '@/server/error';

//§—————————————————————————————————————————————————————————————————————————————————————————————§//
//§                                         CLIENT ONLY                                         §//
/**
 *§ These functions should only be used on the client side and in the middleware.
 *#
 *# Using them on the server is inefficient and unnecessary, since the server can use all the
 *# necessary tools directly. The same can't be done in the middleware, since node.js packages
 *# can't be imported for some reason. The jwt verification must use node:crypto, so that path
 *# is closed.
 *#
 *? NOTE to me: Apparently the support fore node in next middleware is now in the canary
 *? stage of development. (2025-06-16)
 */
//§—————————————————————————————————————————————————————————————————————————————————————————————§//

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
            new URL(`/auth/restricted`, ENV_CONFIG_PUBLIC.ORIGIN)
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
                `/auth/restricted?${params.toString()}`,
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
 * @throws MiddlewareError (redirect to '/auth/restricted') If some of the checks fail.
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

    const session = request.cookies.get(JWT_COOKIE_NAME)?.value;

    // User is trying to access a protected route without a session.
    // If the route is for bros only, kick them out.
    if (!session && routeConfig.roles !== null) {
        return redirectToRestrictedWithLogin(pathname);
    }

    // If the route is for guests only, let them in.
    if (!session && routeConfig.roles === null) {
        return null;
    }

    let user: UserDTO;

    try {
        user = await apiClient.auth.getCurrentUser({
            headers: { 'Cookie': `jwt=${session}` }
        });
    } catch (error) {
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
        routeConfig.roles &&
        !routeConfig.roles.includes(user.role as UserRole)
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
