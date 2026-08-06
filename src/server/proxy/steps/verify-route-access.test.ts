import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

//|=============================================================================================|//
//$                                           MOCKS                                             $//
//|=============================================================================================|//

//# Mocking the session module keeps the whole cookie/redis chain out of the test - the
//# only thing this step needs from it is "is there a valid session, and whose is it".

vi.mock('@/server/utils/session/verify-server', () => ({
    verifySessionFromCookie: vi.fn()
}));

//|=============================================================================================|//
//$                                          IMPORTS                                            $//
//|=============================================================================================|//

import { verifyRouteAccess } from './verify-route-access';
import { verifySessionFromCookie } from '@/server/utils/session/verify-server';
import { MiddlewareError } from '@/server/error';
import { ROUTES } from '@/common/constants';
import { Status, UserRole } from '@/common/types';
import { createMockSession } from '@/server/utils/tests';

const mockVerifySession = vi.mocked(verifySessionFromCookie);

//|=============================================================================================|//
//$                                          HELPERS                                            $//
//|=============================================================================================|//

const makeRequest = (path: string) =>
    new NextRequest(`http://localhost:3000${path}`);

function asGuest() {
    mockVerifySession.mockResolvedValue({ isLoggedIn: false, session: null });
}

function asUser(overrides: Parameters<typeof createMockSession>[0] = {}): void {
    mockVerifySession.mockResolvedValue({
        isLoggedIn: true,
        session: createMockSession(overrides)
    });
}

/** Asserts the step lets the request through untouched. */
async function expectAllowed(path: string) {
    await expect(verifyRouteAccess(makeRequest(path))).resolves.toBeNull();
}

/**
 * Asserts the step blocks the request, and hands back the redirect target so
 * the caller can make claims about the path and its query.
 */
async function expectRedirect(path: string): Promise<URL> {
    const thrown = await verifyRouteAccess(makeRequest(path)).then(
        () => null,
        (error: unknown) => error
    );

    expect(thrown).toBeInstanceOf(MiddlewareError);

    const location = (thrown as MiddlewareError).response.headers.get(
        'location'
    );

    expect(location).not.toBeNull();

    return new URL(location as string);
}

//|=============================================================================================|//
//$                                           TESTS                                             $//
//|=============================================================================================|//

describe('verifyRouteAccess', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        asGuest();
    });

    //~-----------------------------------------------------------------------------------------~//
    //$                                     ROUTE MATCHING                                       $//
    //~-----------------------------------------------------------------------------------------~//

    describe('route matching', () => {
        it('ignores routes that carry no policy', async () => {
            asUser();

            await expectAllowed(ROUTES.home);
            await expectAllowed('/kontakt');
            await expectAllowed('/recepty/gulas');
            await expectAllowed('/recept/123456/moje-buchta');

            // The session is never even looked up for an unprotected route.
            expect(mockVerifySession).not.toHaveBeenCalled();
        });

        it('applies a policy to child routes of a protected prefix', async () => {
            asUser({ userRole: UserRole.User });

            // /admin is admin-only, and that has to reach everything beneath it.
            const redirect = await expectRedirect(ROUTES.admin.users);

            expect(redirect.pathname).toBe(ROUTES.error.restricted);
        });

        it('does not let a policy leak onto a sibling route sharing its prefix', async () => {
            asUser();

            //! Regression: /auth/verify-email is guests-only, and a bare startsWith
            //! test made it capture /auth/verify-email-change too. A signed-in user
            //! clicking the confirmation link mailed to their new address was 307'd
            //! to the homepage, silently dropping the token.
            await expectAllowed(ROUTES.auth.verifyEmailChange);
            await expectAllowed(
                `${ROUTES.auth.verifyEmailChange}?token=abc123`
            );
        });

        it('keeps the confirmation route reachable for signed-out visitors too', async () => {
            asGuest();

            await expectAllowed(ROUTES.auth.verifyEmailChange);
        });
    });

    //~-----------------------------------------------------------------------------------------~//
    //$                                     GUEST-ONLY ROUTES                                    $//
    //~-----------------------------------------------------------------------------------------~//

    describe('guest-only routes', () => {
        it('lets anonymous visitors in', async () => {
            await expectAllowed(ROUTES.auth.login);
            await expectAllowed(ROUTES.auth.register);
            await expectAllowed(ROUTES.auth.verifyEmail);
        });

        it('sends authenticated users to the root', async () => {
            asUser();

            const redirect = await expectRedirect(ROUTES.auth.login);

            expect(redirect.pathname).toBe(ROUTES.home);
        });

        it('still guards the exact path the prefix fix narrowed', async () => {
            asUser();

            const redirect = await expectRedirect(ROUTES.auth.verifyEmail);

            expect(redirect.pathname).toBe(ROUTES.home);
        });
    });

    //~-----------------------------------------------------------------------------------------~//
    //$                                    PROTECTED ROUTES                                      $//
    //~-----------------------------------------------------------------------------------------~//

    describe('routes requiring authentication', () => {
        it('sends anonymous visitors to the login screen with a return target', async () => {
            const redirect = await expectRedirect(ROUTES.recipe.create);

            expect(redirect.pathname).toBe(ROUTES.error.restricted);
            expect(redirect.searchParams.get('anonymous')).toBe('true');
            expect(redirect.searchParams.get('target')).toBe(
                ROUTES.recipe.create
            );
        });

        it('treats a failed session lookup as anonymous', async () => {
            mockVerifySession.mockRejectedValue(new Error('redis is down'));

            const redirect = await expectRedirect(ROUTES.shoppingList);

            expect(redirect.pathname).toBe(ROUTES.error.restricted);
            expect(redirect.searchParams.get('target')).toBe(
                ROUTES.shoppingList
            );
        });

        it('lets an authenticated user through', async () => {
            asUser();

            await expectAllowed(ROUTES.recipe.create);
            await expectAllowed(ROUTES.user.changeEmail);
        });
    });

    //~-----------------------------------------------------------------------------------------~//
    //$                                     ACCOUNT STATUS                                       $//
    //~-----------------------------------------------------------------------------------------~//

    describe('account status', () => {
        it('diverts banned users', async () => {
            asUser({ status: Status.Banned });

            const redirect = await expectRedirect(ROUTES.recipe.create);

            expect(redirect.pathname).toBe(ROUTES.error.banned);
        });

        it('confines users pending deletion to their profile', async () => {
            asUser({ userId: 42, status: Status.PendingDeletion });

            const redirect = await expectRedirect(ROUTES.recipe.create);

            expect(redirect.pathname).toBe(ROUTES.user.detail(42));
        });

        it('leaves a user pending deletion sitting on their own profile', async () => {
            asUser({ userId: 42, status: Status.PendingDeletion });

            //? Tripwire, not a behaviour test. This passes today because /profil
            //? carries no policy, so the step bails out before the status check.
            //? The moment /profil gains one, the unconditional redirect above
            //? becomes an infinite loop - and this is what says so.
            await expectAllowed(ROUTES.user.detail(42));
        });
    });

    //~-----------------------------------------------------------------------------------------~//
    //$                                          ROLES                                           $//
    //~-----------------------------------------------------------------------------------------~//

    describe('role checks', () => {
        it('turns away authenticated users without the required role', async () => {
            asUser({ userRole: UserRole.User });

            const redirect = await expectRedirect(ROUTES.admin.root);

            expect(redirect.pathname).toBe(ROUTES.error.restricted);
            // No login prompt - they are signed in, just not permitted.
            expect(redirect.searchParams.get('anonymous')).toBeNull();
        });

        it('admits users holding the required role', async () => {
            asUser({ userRole: UserRole.Admin });

            await expectAllowed(ROUTES.admin.root);
            await expectAllowed(ROUTES.admin.users);
        });
    });
});
