import type { NextRequest } from 'next/server';
import { RequestContext } from '@/server/utils/reqwest/context';
import { handleServerError } from '@/server/utils/reqwest';
import { logRequest, logResponse } from '@/server/logger';
import { userService } from '@/server/services/user/service';

//|=============================================================================================|//

/**
 * Handles POST requests to `/api/users/reset-password` to send a password reset email to the user.
 *
 * @param request - The incoming Next.js request object containing the user's email.
 * @returns A JSON response with a message indicating that the password reset email has been sent.
 * @throws {Error} Throws an error if the request fails.
 */
export async function POST(request: NextRequest) {
    return RequestContext.run(request, async () => {
        try {
            logRequest(request);

            const { email } = await request.json();

            await userService.sendPasswordResetEmail(email);

            const response = Response.json({
                message: 'Password reset email sent'
            });

            logResponse(response);
            return response;
        } catch (error: any) {
            return handleServerError(error);
        }
    });
}

/**
 * Handles PUT requests to `/api/users/reset-password` to reset a user's password.
 *
 * @param request - The incoming Next.js request object containing the user's token and new password.
 * @returns A JSON response with a message indicating that the password reset was successful.
 * @throws {Error} Throws an error if the request fails.
 */
export async function PUT(request: NextRequest) {
    return RequestContext.run(request, async () => {
        try {
            logRequest(request);

            const { token, password } = await request.json();

            await userService.resetPassword(token, password);

            const response = Response.json({
                message: 'Password reset successful'
            });

            logResponse(response);
            return response;
        } catch (error: any) {
            return handleServerError(error);
        }
    });
}
