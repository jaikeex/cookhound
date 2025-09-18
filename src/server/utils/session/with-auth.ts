import type { NextRequest } from 'next/server';
import { RequestContext } from '@/server/utils/reqwest/context';
import { AuthErrorUnauthorized } from '@/server/error';
import { UserRole } from '@/common/types';
import { handleServerError } from '@/server/utils/reqwest/handleApiError';

/**
 * hoc to guard route handlers and allow access only to authenticated users.
 */
export function withAuth<
    T extends (req: NextRequest, context?: any) => Promise<Response>
>(handler: T): T {
    const authGuard = async (
        ...args: Parameters<T>
    ): Promise<Awaited<ReturnType<T>>> => {
        const [req] = args as Parameters<T>;

        return RequestContext.run(req, async () => {
            if (RequestContext.getUserRole() === UserRole.Guest) {
                return handleServerError(new AuthErrorUnauthorized());
            }

            // Forward the original arguments to the wrapped handler
            return (
                handler as unknown as (
                    ...a: Parameters<T>
                ) => Awaited<ReturnType<T>>
            )(...args);
        }) as Awaited<ReturnType<T>>;
    };

    // Cast is safe because `authGuard` preserves the handler's signature
    return authGuard as unknown as T;
}
