import { userService } from '@/server/services';
import type { NextRequest } from 'next/server';
import {
    assertAnonymous,
    created,
    makeHandler,
    readJson,
    validatePayload
} from '@/server/utils/reqwest';
import { AuthErrorForbidden } from '@/server/error';
import { z } from 'zod';
import { ApplicationErrorCode } from '@/server/error/codes';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const UserForCreateSchema = z.strictObject({
    email: z.email().trim(),
    password: z.string().trim().min(6).max(40),
    username: z.string().trim().min(3).max(40)
});

//|=============================================================================================|//
//?                                           HANDLERS                                          ?//
//|=============================================================================================|//

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
async function postHandler(request: NextRequest) {
    assertAnonymous(
        new AuthErrorForbidden(
            'auth.error.user-already-logged-in',
            ApplicationErrorCode.ALREADY_LOGGED_IN
        )
    );

    const rawPayload = await readJson(request);

    const payload = validatePayload(UserForCreateSchema, rawPayload);

    const user = await userService.createUser(payload);

    return created(user);
}

export const POST = makeHandler(postHandler);
