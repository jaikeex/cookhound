import { isE2ETestMode } from '@/common/constants/env';
import db from '@/server/db/model';
import { NotFoundError } from '@/server/error';
import { ApplicationErrorCode } from '@/server/error/codes';
import {
    makeHandler,
    ok,
    readJson,
    validatePayload
} from '@/server/utils/reqwest';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const GetVerificationTokenSchema = z.strictObject({
    email: z.email().trim()
});

//|=============================================================================================|//
//?                                           HANDLERS                                          ?//
//|=============================================================================================|//

/**
 * Test helper endpoint to retrieve a user's email verification token.
 * This endpoint is ONLY available when E2E_TEST_MODE is enabled.
 *
 * @param request - The incoming Next.js request object containing the user email.
 * @returns A JSON response with the verification token or an error message.
 *
 * - 200: Success, with the verification token.
 * - 404: Not Found, if E2E test mode is disabled or user not found.
 */
async function postHandler(request: NextRequest) {
    if (!isE2ETestMode()) {
        throw new NotFoundError();
    }

    const rawPayload = await readJson(request);
    const payload = validatePayload(GetVerificationTokenSchema, rawPayload);

    const user = await db.user.getOneByEmail(payload.email, {
        email: true,
        emailVerificationToken: true
    });

    if (!user) {
        throw new NotFoundError(
            'auth.error.user-not-found',
            ApplicationErrorCode.USER_NOT_FOUND
        );
    }

    return ok({
        token: user.emailVerificationToken,
        email: user.email
    });
}

// Only export handler when in E2E test mode
export const POST = isE2ETestMode() ? makeHandler(postHandler) : undefined;
