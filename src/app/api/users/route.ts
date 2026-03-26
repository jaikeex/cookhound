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
import { withRateLimit } from '@/server/utils/rate-limit';
import { verifyCaptcha } from '@/server/utils/captcha';
import { registerRouteDocs, UserResponseSchema } from '@/server/utils/api-docs';
import { AuthLevel } from '@/common/types';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const UserForCreateSchema = z.strictObject({
    email: z.email().trim(),
    password: z
        .string()
        .trim()
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/,
            'auth.error.password-missing-character'
        )
        .min(6, 'auth.error.password-min-length')
        .min(1, 'auth.error.password-required')
        .max(40, 'auth.error.password-max-length'),
    username: z.string().trim().min(3).max(40),
    termsAccepted: z.boolean(),
    captchaToken: z.string().min(1)
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

    await verifyCaptcha(payload.captchaToken, 'register');

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

export const POST = makeHandler(
    postHandler,
    withRateLimit({
        maxRequests: 10,
        windowSizeInSeconds: 60 * 60 // 1 hour
    })
);

//|=============================================================================================|//
//?                                        DOCUMENTATION                                        ?//
//|=============================================================================================|//

registerRouteDocs('/api/users', {
    category: 'Users',
    subcategory: 'Registration',
    POST: {
        summary: 'Register a new user account.',
        description: `Sends a verification email after creation.`,
        auth: AuthLevel.GUEST,
        rateLimit: { maxRequests: 10, windowSizeInSeconds: 3600 },
        bodySchema: UserForCreateSchema,
        captchaRequired: true,
        clientUsage: [
            {
                apiClient: 'apiClient.user.createUser',
                hook: 'chqc.user.useCreateUser'
            }
        ],
        responses: {
            201: {
                description: 'User created',
                schema: UserResponseSchema
            },
            400: 'Validation failed',
            403: 'Already authenticated',
            409: 'Email or username already taken',
            429: 'Rate limit exceeded'
        }
    }
});
