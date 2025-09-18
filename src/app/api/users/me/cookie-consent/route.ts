import type { CookieConsentForCreate } from '@/common/types/cookie-consent';
import { ValidationError } from '@/server/error';
import { ApplicationErrorCode } from '@/server/error/codes';
import { logRequest, logResponse } from '@/server/logger';
import { userService } from '@/server/services';
import { handleServerError, validatePayload } from '@/server/utils/reqwest';
import { RequestContext } from '@/server/utils/reqwest/context';
import type { NextRequest } from 'next/server';
import z from 'zod';
import { CONSENT_HASHES } from '@/common/constants';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const UserCookieConsentForCreateSchema = z.strictObject({
    consent: z.boolean(),
    version: z.string(),
    createdAt: z.coerce.date(),
    accepted: z.array(
        z.enum(['essential', 'preferences', 'analytics', 'marketing'])
    )
});

//|=============================================================================================|//
//?                                          HANDLERS                                           ?//
//|=============================================================================================|//

/**
 * Handles POST requests to `/api/users/me/cookie-consent` to create a new user cookie consent.
 *
 * @param request - The incoming Next.js request object.
 * @returns A JSON response with the created user cookie consent.
 */
export async function POST(request: NextRequest) {
    return RequestContext.run(request, async () => {
        try {
            logRequest(request);

            const userId = RequestContext.getUserId();

            if (!userId) {
                throw new ValidationError(
                    'auth.error.unauthorized',
                    ApplicationErrorCode.UNAUTHORIZED
                );
            }

            const rawPayload = await request.json();

            const payload = validatePayload(
                UserCookieConsentForCreateSchema,
                rawPayload
            );

            const userIpAddress = RequestContext.getIp() || '';
            const userAgent = RequestContext.getUserAgent() || '';

            const payloadWithServerData: CookieConsentForCreate = {
                ...payload,
                userIpAddress,
                userAgent,
                proofHash:
                    CONSENT_HASHES[
                        payload.version as keyof typeof CONSENT_HASHES
                    ]
            };

            const cookieConsent = await userService.createUserCookieConsent(
                userId,
                payloadWithServerData
            );

            const response = Response.json(cookieConsent);

            logResponse(response);

            return response;
        } catch (error: unknown) {
            return handleServerError(error);
        }
    });
}
