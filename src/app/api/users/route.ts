import { userService } from '@/server/services';
import type { NextRequest } from 'next/server';
import { handleServerError, validatePayload } from '@/server/utils/reqwest';
import { ServerError } from '@/server/error';
import { logRequest, logResponse } from '@/server/logger';
import { RequestContext } from '@/server/utils/reqwest/context';
import { UserRole } from '@/common/types';
import { z } from 'zod';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const UserForCreateSchema = z.strictObject({
    email: z.string().trim().email(),
    password: z.string().trim().min(6).max(40),
    username: z.string().trim().min(3).max(20)
});

//|=============================================================================================|//
//?                                           HANDLERS                                          ?//
//|=============================================================================================|//

/**
 * Handles GET requests to `/api/user` to fetch users.
 *
 * @returns A JSON response with a list of users.
 * @todo Implement the logic to fetch users.
 */
export async function GET() {
    return Response.json({ message: 'Hello, world!' });
}

/**
 * Handles POST requests to `/api/user` to create a new user.
 *
 * ! This endpoint is restricted and only accessible to guests.
 *
 * @param request - The incoming Next.js request object containing the user data.
 * @returns A JSON response with the created user object or an error message.
 *
 * - 200: Success, with the created user object.
 * - 400: Bad Request, if the email, password, or username is missing.
 * - 409: Conflict, if the email or username is already taken.
 * - 500: Internal Server Error, if there is another error during user creation.
 */
export async function POST(request: NextRequest) {
    return RequestContext.run(request, async () => {
        try {
            logRequest(request);

            // Check if the user is already logged in.
            if (RequestContext.getUserRole() !== UserRole.Guest) {
                throw new ServerError('auth.error.user-already-logged-in', 400);
            }

            const rawPayload = await request.json();

            const payload = validatePayload(UserForCreateSchema, rawPayload);

            const user = await userService.createUser(payload);

            const response = Response.json({ user }, { status: 201 });

            logResponse(response);
            return response;
        } catch (error: unknown) {
            return handleServerError(error);
        }
    });
}

/**
 * Handles PUT requests to `/api/user` to update a user.
 *
 * @returns A JSON response indicating the result of the update operation.
 * @todo Implement the logic to update a user.
 */
export async function PUT() {
    return Response.json({ message: 'Hello, world!' });
}
