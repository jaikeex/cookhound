import { userService } from '@/server/services';
import type { NextRequest } from 'next/server';
import {
    assertAnonymous,
    created,
    makeHandler,
    readJson,
    validatePayload
} from '@/server/utils/reqwest';
import { AuthErrorForbidden, ValidationError } from '@/server/error';
import { z } from 'zod';
import { ApplicationErrorCode } from '@/server/error/codes';
import { TERMS_VERSION } from '@/common/constants';
import type { TermsAcceptanceForCreate } from '@/common/types';
import { RequestContext } from '@/server/utils/reqwest/context';
import { generateProofHash } from '@/server/utils/crypto';
import { serializeTermsContent } from '@/server/utils/terms';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const UserForCreateSchema = z.strictObject({
    email: z.email().trim(),
    password: z.string().trim().min(6).max(40),
    username: z.string().trim().min(3).max(40),
    termsAccepted: z.boolean()
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

    if (!payload.termsAccepted) {
        throw new ValidationError(
            'auth.error.terms-required',
            ApplicationErrorCode.VALIDATION_FAILED
        );
    }

    const user = await userService.createUser(payload);

    const userIpAddress = RequestContext.getIp() || '';
    const userAgent = RequestContext.getUserAgent() || '';

    const acceptanceTimestamp = new Date();

    const termsText = serializeTermsContent();

    const proofHash = generateProofHash({
        text: termsText,
        userId: user.id,
        timestamp: acceptanceTimestamp
    });

    const termsAcceptancePayload: TermsAcceptanceForCreate = {
        version: TERMS_VERSION,
        createdAt: acceptanceTimestamp,
        userIpAddress,
        userAgent,
        proofHash
    };

    await userService.createUserTermsAcceptance(
        user.id,
        termsAcceptancePayload
    );

    return created(user);
}

export const POST = makeHandler(postHandler);
