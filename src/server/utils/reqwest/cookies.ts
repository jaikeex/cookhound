import 'server-only';
import { cookies } from 'next/headers';
import { ENV_CONFIG_PUBLIC } from '@/common/constants';

/**
 * The cookie attributes this app sets - a subset of next/headers'
 * ResponseCookie options.
 */
export interface CookieOptions {
    path?: string;
    domain?: string;
    maxAge?: number;
    expires?: Date;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: boolean | 'lax' | 'strict' | 'none';
}

//§—————————————————————————————————————————————————————————————————————————————————————————————§//
//§                                     SINGLE COOKIE SEAM                                      §//
///
//§ Cookie mutation lives here and only here (enforced by the
//§ cookhound/no-raw-cookie-mutation ESLint rule). Centralising it gives one place
//§ to own the attributes shared by every cookie (path / secure / domain) so call
//§ sites only specify what differs (name, value, max-age, same-site).
//§
//§ There is deliberately NO render-origin guard. Cookie mutation is illegal during
//§ an RSC render and Next throws if attempted - that throw is correct and loud. The
//§ read/write split keeps writes at the route/action edge, so a mutation reaching
//§ here during a render is a bug we WANT surfaced, not silently swallowed.
///
//§—————————————————————————————————————————————————————————————————————————————————————————————§//

/** Attributes shared by every cookie this app sets. */
const SHARED_COOKIE_OPTIONS: CookieOptions = {
    path: '/',
    secure: ENV_CONFIG_PUBLIC.ENV === 'production',
    domain: ENV_CONFIG_PUBLIC.COOKIE_DOMAIN
};

/**
 * Set a cookie on the current request's store, merging the app-wide shared
 * attributes with the per-call options (per-call values win).
 *
 * @param name - Cookie name.
 * @param value - Cookie value (already encoded/serialized by the caller).
 * @param options - Per-cookie attributes (max-age, same-site, ...).
 */
export async function setCookie(
    name: string,
    value: string,
    options?: CookieOptions
): Promise<void> {
    const store = await cookies();

    store.set(name, value, { ...SHARED_COOKIE_OPTIONS, ...options });
}

/**
 * Delete a cookie from the current request's store.
 *
 * The shared path/domain attributes are applied on the way out: a browser only
 * clears a cookie when the expiring Set-Cookie matches the original's path and
 * domain, so deletion has to mirror what setCookie() does.
 *
 * @param name - Cookie name to remove.
 */
export async function deleteCookie(name: string): Promise<void> {
    const store = await cookies();

    store.delete({
        name,
        path: SHARED_COOKIE_OPTIONS.path,
        domain: SHARED_COOKIE_OPTIONS.domain
    });
}
