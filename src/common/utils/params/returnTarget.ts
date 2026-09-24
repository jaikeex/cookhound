import { ROUTES } from '@/common/constants/routes';

// Throwaway base for parsing; a target resolving to any other origin is off-site
const LOCAL_ORIGIN = 'http://local.invalid';

// Returning to these after login would land the user on another auth/error screen,
// or on a route that renders no page at all
const NON_RETURNABLE_PREFIXES: readonly string[] = [
    '/api',
    ROUTES.auth.login,
    ROUTES.auth.register,
    ROUTES.auth.resetPassword,
    ROUTES.auth.verifyEmail,
    ROUTES.auth.verifyEmailChange,
    ROUTES.auth.callback.root,
    ROUTES.error.root
];

const isNonReturnable = (pathname: string): boolean =>
    NON_RETURNABLE_PREFIXES.some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );

/**
 * Validates a user-supplied post-login return target. The value comes from the query string,
 * so anything that could navigate off-site must be rejected, otherwise the login page is an open redirect.
 *
 * @param raw - The raw param value (any type, since it may come straight from searchParams).
 * @returns The normalized same-origin path (pathname + search + hash), or null if unsafe.
 */
export const sanitizeReturnTarget = (raw: unknown): string | null => {
    if (typeof raw !== 'string' || !raw.startsWith('/')) {
        return null;
    }

    let url: URL;

    try {
        url = new URL(raw, LOCAL_ORIGIN);
    } catch {
        return null;
    }

    // The URL parser, not a string check, decides the origin
    if (url.origin !== LOCAL_ORIGIN || isNonReturnable(url.pathname)) {
        return null;
    }

    return `${url.pathname}${url.search}${url.hash}`;
};
