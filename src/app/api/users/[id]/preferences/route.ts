import { ApplicationErrorCode } from '@/server/error/codes';
import { ValidationError } from '@/server/error/server';
import { logRequest, logResponse } from '@/server/logger';
import { userService } from '@/server/services/user/service';
import { handleServerError, validatePayload } from '@/server/utils/reqwest';
import { RequestContext } from '@/server/utils/reqwest/context';
import type { NextRequest } from 'next/server';
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
export async function PUT(request: NextRequest) {
    return RequestContext.run(request, async () => {
        try {
            logRequest(request);

            const userId = request.nextUrl.pathname.split('/').at(-2);

            if (!userId || isNaN(Number(userId))) {
                throw new ValidationError(
                    'app.error.bad-request',
                    ApplicationErrorCode.MISSING_FIELD
                );
            }

            const rawPayload = await request.json();

            const payload = validatePayload(
                UserPreferencesForUpdateSchema,
                rawPayload
            );

            await userService.updateUserPreferences(Number(userId), payload);

            const response = Response.json({
                message: 'user preferences updated'
            });

            logResponse(response);

            return response;
        } catch (error: unknown) {
            return handleServerError(error);
        }
    });
}
