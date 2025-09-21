import type { NextRequest } from 'next/server';
import { RequestContext } from '@/server/utils/reqwest/context';
import { AuthErrorUnauthorized } from '@/server/error';
import { UserRole } from '@/common/types';
import { handleServerError } from '@/server/utils/reqwest/handleApiError';

/**
 * hoc to guard route handlers and allow access only to authenticated users.
 */
export function withAuth<
    S extends unknown[],
    T extends (req: NextRequest, ...rest: S) => Promise<Response>
>(handler: T): T {
    const authGuard = async (
        ...args: Parameters<T>
    ): Promise<Awaited<ReturnType<T>>> => {
        const userId = RequestContext.getUserId();
        const userRole = RequestContext.getUserRole();

        if (!userId || userRole === UserRole.Guest) {
            return handleServerError(new AuthErrorUnauthorized()) as Awaited<
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

    return authGuard as unknown as T;
}
