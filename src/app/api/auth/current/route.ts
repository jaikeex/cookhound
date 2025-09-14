import { logRequest, logResponse } from '@/server/logger';
import { authService } from '@/server/services/auth/service';
import { RequestContext } from '@/server/utils/reqwest/context';
import { handleServerError } from '@/server/utils/reqwest';

//|=============================================================================================|//

/**
 * Handles GET requests to `/api/auth/current` to fetch the current user.
 *
 * @returns A JSON response with the user object on success, or an error
 * response on failure.
 *
 * - 200: Success, with user object.
 * - 401: Unauthorized, if session is missing or invalid.
 * - 404: Not Found, if user from session does not exist.
 */
export async function GET(request: Request) {
    return RequestContext.run(request, async () => {
        try {
            logRequest(request);

            const user = await authService.getCurrentUser();
            const response = Response.json(user);

            logResponse(response);
            return response;
        } catch (error: unknown) {
            return handleServerError(error);
        }
    });
}
