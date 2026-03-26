import { withRateLimit } from '@/server/utils/rate-limit/wrapper';
import { makeHandler, noContent, withAuth } from '@/server/utils/reqwest';
import { authService } from '@/server/services/auth/service';
import { registerRouteDocs } from '@/server/utils/api-docs/registry';
import { AuthLevel } from '@/common/types';

async function postHandler() {
    await authService.logoutEverywhere();

    return noContent();
}

export const POST = makeHandler(
    postHandler,
    withAuth,
    withRateLimit({ maxRequests: 5, windowSizeInSeconds: 60 })
);

//|=============================================================================================|//
//?                                        DOCUMENTATION                                        ?//
//|=============================================================================================|//

registerRouteDocs('/api/auth/logout-all', {
    category: 'Auth',
    subcategory: 'Session',
    POST: {
        summary: 'Log out all sessions for the current user.',
        description: `Invalidates every active session for the
            authenticated user, including the current one.`,
        auth: AuthLevel.AUTHENTICATED,
        rateLimit: { maxRequests: 5, windowSizeInSeconds: 60 },
        clientUsage: [
            {
                apiClient: 'apiClient.auth.logoutAll',
                hook: 'chqc.auth.useLogoutAll'
            }
        ],
        responses: {
            204: 'All sessions invalidated',
            401: 'Not authenticated',
            429: 'Rate limit exceeded'
        }
    }
});
