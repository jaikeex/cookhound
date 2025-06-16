import { authService } from '@/server/services/auth/service';
import { handleApiError } from '@/server/utils';

/**
 * Handles POST requests to `/auth/logout` to log out the current user.
 *
 * ! This endpoint is restricted and only accessible to authenticated users.
 *
 * @returns A JSON response with a success message on success, or an error
 * response on failure.
 *
 * - 200: Success, with a success message.
 * - 500: Internal Server Error, if there is another error during logout.
 */
export async function POST() {
    try {
        await authService.logout();

        return Response.json({ message: 'Logged out successfully' });
    } catch (error: any) {
        return handleApiError(error);
    }
}
