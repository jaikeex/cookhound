import { authService } from '@/server/services/auth/service';
import { handleApiError } from '@/server/utils';

/**
 * Handles GET requests to `/api/auth/current` to fetch the current user.
 *
 * @returns A JSON response with the user object on success, or an error
 * response on failure.
 *
 * - 200: Success, with user object.
 * - 401: Unauthorized, if JWT is missing or invalid.
 * - 404: Not Found, if user from JWT does not exist.
 */
export async function GET() {
    try {
        const user = await authService.getCurrentUser();

        return Response.json(user);
    } catch (error: any) {
        return handleApiError(error);
    }
}
