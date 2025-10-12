import { isE2ETestMode } from '@/common/constants/env';
import db from '@/server/db/model';
import { NotFoundError } from '@/server/error';
import { ApplicationErrorCode } from '@/server/error/codes';
import {
    makeHandler,
    noContent,
    readJson,
    validatePayload
} from '@/server/utils/reqwest';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const CleanupUserSchema = z.strictObject({
    email: z.email().trim()
});

//|=============================================================================================|//
//?                                           HANDLERS                                          ?//
//|=============================================================================================|//

/**
 * Test helper endpoint to delete a user and their associated data.
 * This endpoint is ONLY available when E2E_TEST_MODE is enabled.
 *
 * @param request - The incoming Next.js request object containing the user email.
 * @returns A response indicating success or an error message.
 *
 * - 204: Success, user deleted.
 * - 404: Not Found, if E2E test mode is disabled or user not found.
 */
async function deleteHandler(request: NextRequest) {
    if (!isE2ETestMode()) {
        throw new NotFoundError();
    }

    const rawPayload = await readJson(request);
    const payload = validatePayload(CleanupUserSchema, rawPayload);

    const user = await db.user.getOneByEmail(payload.email, {
        id: true,
        emailVerificationToken: true
    });

    if (!user) {
        throw new NotFoundError(
            'auth.error.user-not-found',
            ApplicationErrorCode.USER_NOT_FOUND
        );
    }

    await db.user.executeHardDeletion(user.id);

    return noContent();
}

// Only export handler when in E2E test mode
export const DELETE = isE2ETestMode() ? makeHandler(deleteHandler) : undefined;
