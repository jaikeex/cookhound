import { ApplicationErrorCode } from '@/server/error/codes';
import { ValidationError } from '@/server/error/server';
import { userService } from '@/server/services/user/service';
import {
    assertSelf,
    makeHandler,
    noContent,
    readJson,
    validatePayload
} from '@/server/utils/reqwest';
import type { NextRequest } from 'next/server';
import { withAuth } from '@/server/utils/reqwest';
import { z } from 'zod';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const UserPreferencesForUpdateSchema = z.strictObject({
    theme: z.enum(['light', 'dark', 'system']).optional(),
    locale: z.enum(['en', 'cs']).optional()
});

//|=============================================================================================|//
//?                                          HANDLERS                                           ?//
//|=============================================================================================|//

/**
 * Handles PUT requests to `/api/users/[id]/preferences` to update a user's preferences.
 *
 * @param request - The incoming Next.js request object.
 * @returns A JSON response with the updated user preferences.
 */
export async function putHandler(request: NextRequest) {
    const userId = request.nextUrl.pathname.split('/').at(-2);

    if (!userId || isNaN(Number(userId))) {
        throw new ValidationError(
            'app.error.bad-request',
            ApplicationErrorCode.MISSING_FIELD
        );
    }

    assertSelf(Number(userId));

    const rawPayload = await readJson(request);

    const payload = validatePayload(UserPreferencesForUpdateSchema, rawPayload);

    await userService.updateUserPreferences(Number(userId), payload);

    return noContent();
}

export const PUT = makeHandler(putHandler, withAuth);
