import { authService } from '@/server/services/auth/service';
import { RequestContext } from '@/server/utils/reqwest/context';
import { makeHandler, noContent } from '@/server/utils/reqwest';
import { withAuth } from '@/server/utils/reqwest';
import { registerRouteDocs } from '@/server/utils/api-docs/registry';
import { AuthLevel } from '@/common/types';

//|=============================================================================================|//

/**
 * Handles POST requests to `/auth/logout` to log out the current user.
 *
 * @returns A JSON response with a success message on success, or an error
 * response on failure.
 *
 * - 200: Success, with a success message.
 * - 500: Internal Server Error, if there is another error during logout.
 */
async function postHandler() {
    const sessionId = RequestContext.getSessionId();

    if (!sessionId) {
        return noContent();
    }

    await authService.logout(sessionId);

    return noContent();
}

export const POST = makeHandler(postHandler, withAuth);

//|=============================================================================================|//
//?                                        DOCUMENTATION                                        ?//
//|=============================================================================================|//

registerRouteDocs('/api/auth/logout', {
    category: 'Auth',
    subcategory: 'Session',
    POST: {
        summary: 'Log out the current user session.',
        description: `Invalidates the current session only.`,
        auth: AuthLevel.AUTHENTICATED,
        clientUsage: [
            { apiClient: 'apiClient.auth.logout', hook: 'chqc.auth.useLogout' }
        ],
        responses: {
            204: 'Logged out',
            401: 'Not authenticated'
        }
    }
});
