// with-origin-guard.ts

import type { NextRequest, NextResponse } from 'next/server';
import { AuthErrorForbidden } from '@/server/error';
import { ENV_CONFIG_PRIVATE } from '@/common/constants/env';

const ALLOWED_ORIGINS: ReadonlyArray<string> =
    ENV_CONFIG_PRIVATE.ALLOWED_ORIGINS.split(',')
        .map((o) => o.trim())
        .filter(Boolean);

/**
 * Simple guard to mitigate csrf.
 * For every state changing request it ensures that the incoming Origin or Referer header matches
 * one of the configured allowed origins. If the check fails the middleware throws a 403.
 *
 *? This implementation relies on using correct http methods for any action that needs to be
 *? protected. State changing request MUST be one of POST, PUT, PATCH, DELETE.
 */
export function withOriginGuard<
    T extends (
        req: NextRequest,
        ...rest: any[]
    ) => Promise<NextResponse> | NextResponse
>(handler: T): T {
    const guard = async (
        ...args: Parameters<T>
    ): Promise<Awaited<ReturnType<T>>> => {
        const [req] = args as Parameters<T>;

        // these methods do not (or should not...) mutate state server side, skip.
        if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
            return (
                handler as unknown as (
                    ...a: Parameters<T>
                ) => Awaited<ReturnType<T>>
            )(...args);
        }

        const origin = req.headers.get('origin');
        const referer = req.headers.get('referer');

        const isAllowed = (value: string | null): boolean => {
            if (!value) return false;

            try {
                const { protocol, host } = new URL(value);
                return ALLOWED_ORIGINS.includes(`${protocol}//${host}`);
            } catch {
                return false;
            }
        };

        if (!isAllowed(origin) && !isAllowed(referer)) {
            // possible csrf attempt, never conttinue
            throw new AuthErrorForbidden();
        }

        return (
            handler as unknown as (
                ...a: Parameters<T>
            ) => Awaited<ReturnType<T>>
        )(...args);
    };

    return guard as unknown as T;
}
