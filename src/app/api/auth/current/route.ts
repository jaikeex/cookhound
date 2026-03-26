import { authService } from '@/server/services/auth/service';
import { makeHandler, ok } from '@/server/utils/reqwest';
import { registerRouteDocs, UserResponseSchema } from '@/server/utils/api-docs';
import { AuthLevel } from '@/common/types';

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
async function getHandler() {
    const user = await authService.getCurrentUser();

    return ok(user);
}

// Not using withAuth here on purpose. @see AuthService.getCurrentUser
export const GET = makeHandler(getHandler);

//|=============================================================================================|//
//?                                        DOCUMENTATION                                        ?//
//|=============================================================================================|//

registerRouteDocs('/api/auth/current', {
    category: 'Auth',
    subcategory: 'Session',
    GET: {
        summary: 'Get the currently authenticated user.',
        description: `Returns the full user profile matching the session cookie, 
            or null if no valid session exists.`,
        auth: AuthLevel.PUBLIC,
        clientUsage: [
            {
                apiClient: 'apiClient.auth.getCurrentUser',
                hook: 'chqc.auth.useCurrentUser'
            }
        ],
        responses: {
            200: {
                description: 'Current user data or null',
                schema: UserResponseSchema.nullable()
            }
        }
    }
});
