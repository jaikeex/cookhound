import type { NextRequest } from 'next/server';
import {
    makeHandler,
    noContent,
    readJson,
    validatePayload
} from '@/server/utils/reqwest';
import { userService } from '@/server/services/user/service';
import { z } from 'zod';
import { withRateLimit } from '@/server/utils/rate-limit';
import { verifyCaptcha } from '@/server/utils/captcha';
import { registerRouteDocs } from '@/server/utils/api-docs/registry';
import { AuthLevel } from '@/common/types';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const SendResetPasswordEmailSchema = z.strictObject({
    email: z.email().trim(),
    captchaToken: z.string().min(1)
});

const ResetPasswordSchema = z.strictObject({
    token: z.string().trim(),
    password: z.string().trim().min(6).max(40)
});

//|=============================================================================================|//
//?                                           HANDLERS                                          ?//
//|=============================================================================================|//

/**
 * Handles POST requests to `/api/users/reset-password` to send a password reset email to the user.
 *
 * @param request - The incoming Next.js request object containing the user's email.
 * @returns A JSON response with a message indicating that the password reset email has been sent.
 * @throws {Error} Throws an error if the request fails.
 */
async function postHandler(request: NextRequest) {
    const rawPayload = await readJson(request);

    const payload = validatePayload(SendResetPasswordEmailSchema, rawPayload);

    await verifyCaptcha(payload.captchaToken, 'reset_password');

    const { email } = payload;

    await userService.sendPasswordResetEmail(email);

    return noContent();
}

/**
 * Handles PUT requests to `/api/users/reset-password` to reset a user's password.
 *
 * @param request - The incoming Next.js request object containing the user's token and new password.
 * @returns A JSON response with a message indicating that the password reset was successful.
 * @throws {Error} Throws an error if the request fails.
 */
async function putHandler(request: NextRequest) {
    const rawPayload = await readJson(request);

    const payload = validatePayload(ResetPasswordSchema, rawPayload);

    const { token, password } = payload;

    await userService.resetPassword(token, password);

    return noContent();
}

export const POST = makeHandler(
    postHandler,
    withRateLimit({
        maxRequests: 5,
        windowSizeInSeconds: 60 * 60 // 1 hour
    })
);

export const PUT = makeHandler(
    putHandler,
    withRateLimit({
        maxRequests: 5,
        windowSizeInSeconds: 60 * 60 // 1 hour
    })
);

//|=============================================================================================|//
//?                                        DOCUMENTATION                                        ?//
//|=============================================================================================|//

registerRouteDocs('/api/users/reset-password', {
    category: 'Users',
    subcategory: 'Account',
    POST: {
        summary: 'Send a password reset email.',
        description: `Always returns 204 regardless of whether the
            email exists.`,
        auth: AuthLevel.PUBLIC,
        rateLimit: { maxRequests: 5, windowSizeInSeconds: 3600 },
        bodySchema: SendResetPasswordEmailSchema,
        captchaRequired: true,
        clientUsage: [
            {
                apiClient: 'apiClient.user.sendResetPasswordEmail',
                hook: 'chqc.user.useSendResetPasswordEmail'
            }
        ],
        responses: {
            204: 'Reset email sent',
            400: 'Validation failed',
            429: 'Rate limit exceeded'
        }
    },
    PUT: {
        summary: 'Reset password using a token from email.',
        description: `Single-use, time-limited token. Invalidates
            all existing sessions on success.`,
        auth: AuthLevel.PUBLIC,
        rateLimit: { maxRequests: 5, windowSizeInSeconds: 3600 },
        bodySchema: ResetPasswordSchema,
        clientUsage: [
            {
                apiClient: 'apiClient.user.resetPassword',
                hook: 'chqc.user.useResetPassword'
            }
        ],
        responses: {
            204: 'Password reset successful',
            400: 'Invalid or expired token',
            429: 'Rate limit exceeded'
        }
    }
});
