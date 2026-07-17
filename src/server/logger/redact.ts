//§—————————————————————————————————————————————————————————————————————————————————————§//
//§                                       WARNING                                       §//
///
//# Field names whose values are secrets must never reach a log sink.
//#
//# Single-use tokens (email verification, password reset, email change),
//# OAuth authorization codes, and passwords all flow into the logger via
//# @LogServiceMethod({ names: [...] }) payloads and inline log.* calls.
//# Redacting by key at the serialisation choke point is what makes this work:
//# because all object logging funnels through safeStringify, any field whose key
//# matches isSensitiveKey() is masked at every call site automatically. The
//# generalisable roots (token/password/secret/...) cover their compounds by
//# trailing segment; the overloaded roots (code/key/hash) are matched exactly, so
//# a NEW secret-bearing compound of those must be added to SENSITIVE_EXACT_KEYS.
///
//§—————————————————————————————————————————————————————————————————————————————————————§//

export const REDACTED = '[REDACTED]';

const SENSITIVE_TRAILING_ROOTS = new Set([
    'token',
    'password',
    'passphrase',
    'secret',
    'credential',
    'credentials'
]);

const SENSITIVE_EXACT_KEYS = new Set([
    'code',
    'authcode',
    'authorizationcode',
    'oauthcode',
    'verificationcode',
    'resetcode',
    'apikey',
    'passwordhash',
    'authorization',
    'cookie',
    'sessionid',
    'otp',
    'pin'
]);

function segmentKey(key: string): string[] {
    return key
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2') // camelCase boundary
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2') // ACRONYM|Word boundary
        .split(/[\s_\-.]+/)
        .filter(Boolean)
        .map((segment) => segment.toLowerCase());
}

/**
 * Decide whether a value stored under `key` must be masked.
 */
export function isSensitiveKey(key: string): boolean {
    if (!key) {
        return false;
    }

    if (SENSITIVE_EXACT_KEYS.has(key.toLowerCase())) {
        return true;
    }

    const segments = segmentKey(key);
    const trailing = segments[segments.length - 1] ?? '';

    for (const root of SENSITIVE_TRAILING_ROOTS) {
        if (trailing.endsWith(root)) {
            return true;
        }
    }

    return false;
}

export function redactSensitiveReplacer(key: string, value: unknown): unknown {
    if (isSensitiveKey(key)) {
        return REDACTED;
    }

    return value;
}

/**
 * Attempt to stringify a value while guarding against circular structures.
 * Falls back to `toString()` if `JSON.stringify` fails.
 */
export function safeStringify(value: unknown): string {
    /**
     * Preserve plain strings as is so that existing characters render correctly in both the
     * console and file outputs. Calling `util.inspect` or `JSON.stringify` on a string would escape everything,
     * causing the readability of log to go negative. By short-circuiting here multiline messages are kept intact.
     */

    if (typeof value === 'string') {
        return value;
    }

    try {
        /**
         * This is a useful tool for debugging, as it makes the log print any appended object
         * as a beautified json. Leaving it for reference here.
         */
        // const isDev = ENV_CONFIG_PUBLIC.ENV !== 'production';

        // if (isDev) {
        //     return util.inspect(value, {
        //         depth: null,
        //         compact: false,
        //         breakLength: 120
        //     });
        // }

        return JSON.stringify(value, redactSensitiveReplacer);
    } catch {
        try {
            return String(value);
        } catch {
            return '[Unserialisable value]';
        }
    }
}
