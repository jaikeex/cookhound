import * as cookie from 'cookie';
import { ENV_CONFIG_PUBLIC } from '@/common/constants/env';

export type CookieOptions = Readonly<{
    /**
     * Cookie path attribute. Defaults to '/'.
     */
    path?: string;
    /**
     * Cookie max-age in seconds.
     */
    maxAge?: number;
    /**
     * SameSite attribute. Defaults to 'Lax'.
     */
    sameSite?: 'Lax' | 'Strict' | 'None';
    /**
     * Whether to include the Secure flag. Defaults to true when the current page is served over https.
     */
    secure?: boolean;
    /**
     * Domain attribute. If undefined, it will default to the current host.
     */
    domain?: string;
}>;

//?—————————————————————————————————————————————————————————————————————————————————?//
//?                                   SECURE FLAG                                   ?//
///
//# This is the only true secure flag definition. Browsers will only
//# overwrite/delete a cookie when the new Set-Cookie (or document.cookie = …)
//# matches all those key attributes. The flag used must mirror the target in every
//# call, regardless the current connection or environment used. This ensures
//# exactly that.
///
//?—————————————————————————————————————————————————————————————————————————————————?//

const isSecure =
    typeof window !== 'undefined'
        ? window.location.protocol === 'https:'
        : process.env.NODE_ENV === 'production';

const DEFAULT_COOKIE_OPTIONS = {
    path: '/',
    sameSite: 'Lax',
    secure: isSecure,
    domain: ENV_CONFIG_PUBLIC.COOKIE_DOMAIN ?? undefined
} as const;

/**
 * Set a cookie in the browser.
 * No-op in non-browser environments.
 */
export const setCookie = (
    name: string,
    value: string,
    opts: CookieOptions = {}
): void => {
    if (typeof document === 'undefined') return;

    const { maxAge, sameSite, ...other } = {
        ...DEFAULT_COOKIE_OPTIONS,
        ...opts
    } as Required<CookieOptions>;

    document.cookie = cookie.serialize(name, encodeURIComponent(value), {
        ...other,
        sameSite:
            (sameSite?.toLowerCase() as 'lax' | 'strict' | 'none') ?? undefined,
        maxAge,
        expires:
            typeof maxAge === 'number'
                ? new Date(Date.now() + maxAge * 1000)
                : undefined
    });
};

/**
 * Retrieve a cookie value. Returns null if not found or not in browser.
 */
export const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;

    const parsed = cookie.parse(document.cookie);
    const raw = parsed[name];

    return raw ? decodeURIComponent(raw) : null;
};

/**
 * Delete a cookie by setting Max-Age=0.
 */
export const deleteCookie = (name: string, path: string = '/'): void => {
    setCookie(name, '', { path, maxAge: 0 });
};
