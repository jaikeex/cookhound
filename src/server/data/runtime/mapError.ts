import 'server-only';
import {
    AuthErrorForbidden,
    AuthErrorUnauthorized,
    NotFoundError
} from '@/server/error';
import { redirectToRestrictedWithLogin } from '@/server/utils/reqwest/redirects';
import { notFound } from 'next/navigation';

/**
 * Translate a service error thrown during an RSC render into the appropriate
 * Next.js navigation side effect.
 *
 * Apply this explicitly at render call sites; serverData methods stay raw and
 * rethrow the service as they are, leaving the caller to choose the
 * response. Mirrors the boundary-only error mapping that handleServerError does for API routes.
 *
 * § Do NOT call this from generateMetadata: notFound() / redirect() are
 * § no-ops there. Metadata should try/catch and return fallback tags instead.
 *
 * @param error - The thrown service error.
 * @param targetPath - Where to send the user back after logging in, used for the
 *                      auth-wall redirect.
 * @returns Never — every branch throws (navigation helpers throw too).
 */
export function mapServiceErrorForRsc(
    error: unknown,
    targetPath: string
): never {
    if (error instanceof NotFoundError) {
        notFound();
    }

    if (
        error instanceof AuthErrorUnauthorized ||
        error instanceof AuthErrorForbidden
    ) {
        redirectToRestrictedWithLogin(targetPath);
    }

    // Everything else bubbles to the nearest error boundary.
    throw error;
}
