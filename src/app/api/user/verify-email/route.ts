import { userService } from '@/server/services';
import { handleApiError } from '@/server/utils';
import type { NextRequest } from 'next/server';

/**
 * Handles POST requests to `/api/user/verify-email` to resend a verification email.
 *
 * @returns A JSON response indicating the result of the operation.
 * @todo Implement the logic to resend a verification email.
 */
export async function POST() {
    return Response.json({ message: 'Hello, world!' });
}

/**
 * Handles PUT requests to `/api/user/verify-email` to verify a user's email address.
 * It uses a token from the query parameters to verify the email.
 *
 * @param request - The incoming Next.js request object.
 * @returns A JSON response indicating success or failure of the email verification.
 *
 * - 200: Success, with a success message.
 * - 400: Bad Request, if the token is missing.
 * - 403: Forbidden, if the email is already verified.
 * - 404: Not Found, if the user is not found.
 * - 500: Internal Server Error, if there is another error during email verification.
 */
export async function PUT(request: NextRequest) {
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
        return Response.json({ message: 'Token is required' }, { status: 400 });
    }

    try {
        await userService.verifyEmail(token);
    } catch (error: any) {
        return handleApiError(error);
    }

    return Response.json({ message: 'Email verified successfully' });
}
