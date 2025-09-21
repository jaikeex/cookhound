import { authService } from '@/server/services/auth/service';
import { makeHandler, ok } from '@/server/utils/reqwest';

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
export async function getHandler() {
    const user = await authService.getCurrentUser();

    return ok(user);
}

// Not using withAuth here on purpose. @see AuthService.getCurrentUser
export const GET = makeHandler(getHandler);
