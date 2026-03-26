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
import { SUPPORTED_LOCALES } from '@/common/constants';
import { registerRouteDocs } from '@/server/utils/api-docs/registry';
import { AuthLevel } from '@/common/types';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const UserPreferencesForUpdateSchema = z.strictObject({
    theme: z.enum(['light', 'dark', 'system']).optional(),
    locale: z.enum(SUPPORTED_LOCALES).optional()
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
async function putHandler(request: NextRequest) {
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

// not rate limited by design
export const PUT = makeHandler(putHandler, withAuth);

//|=============================================================================================|//
//?                                        DOCUMENTATION                                        ?//
//|=============================================================================================|//

registerRouteDocs('/api/users/{id}/preferences', {
    category: 'Users',
    subcategory: 'Profile',
    PUT: {
        summary: 'Update user preferences (theme, locale).',
        description: `Owner-only. Persists UI preferences
            (theme, locale).`,
        auth: AuthLevel.AUTHENTICATED,
        bodySchema: UserPreferencesForUpdateSchema,
        clientUsage: [
            {
                apiClient: 'apiClient.user.updateUserPreferences',
                hook: 'chqc.user.useUpdateUserPreferences'
            }
        ],
        responses: {
            204: 'Preferences updated',
            401: 'Not authenticated',
            403: 'Not authorized'
        }
    }
});
