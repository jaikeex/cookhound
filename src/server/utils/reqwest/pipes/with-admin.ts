import type { NextRequest } from 'next/server';
import { AuthErrorUnauthorized, AuthErrorForbidden } from '@/server/error';
import { UserRole } from '@/common/types';
import { RequestContext } from '@/server/utils/reqwest/context';
import { handleServerError } from '@/server/utils/reqwest/handleApiError';

/**
 * hoc to guard route handlers and allow access only to admin users.
 */
export function withAdmin<
    S extends unknown[],
    T extends (req: NextRequest, ...rest: S) => Promise<Response>
>(handler: T): T {
    const adminGuard = async (
        ...args: Parameters<T>
    ): Promise<Awaited<ReturnType<T>>> => {
        const userId = RequestContext.getUserId();
        const userRole = RequestContext.getUserRole();

        if (!userId || userRole === UserRole.Guest) {
            return handleServerError(new AuthErrorUnauthorized()) as Awaited<
                ReturnType<T>
            >;
        }

        if (userRole !== UserRole.Admin) {
            return handleServerError(new AuthErrorForbidden()) as Awaited<
                ReturnType<T>
            >;
        }

        // Forward the original arguments to the wrapped handler
        return (
            handler as unknown as (
                ...a: Parameters<T>
            ) => Awaited<ReturnType<T>>
        )(...args);
    };

    return adminGuard as unknown as T;
}
