import { authService } from '@/server/services/auth/service';
import { RequestContext } from '@/server/utils/reqwest/context';
import { makeHandler, noContent } from '@/server/utils/reqwest';
import { withAuth } from '@/server/utils/reqwest';

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
export async function postHandler() {
    const sessionId = RequestContext.getSessionId();

    if (!sessionId) {
        return noContent();
    }

    await authService.logout(sessionId);

    return noContent();
}

export const POST = makeHandler(postHandler, withAuth);
