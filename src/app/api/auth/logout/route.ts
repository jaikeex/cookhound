import { logRequest, logResponse, RequestContext } from '@/server/logger';
import { authService } from '@/server/services/auth/service';
import { handleServerError } from '@/server/utils';

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
export async function POST(request: Request) {
    return RequestContext.run(request, async () => {
        try {
            logRequest(request);

            await authService.logout();

            const response = Response.json({
                message: 'Logged out successfully'
            });

            logResponse(response);
            return response;
        } catch (error: any) {
            return handleServerError(error);
        }
    });
}
