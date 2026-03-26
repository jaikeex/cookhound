import type { CookieConsentForCreate } from '@/common/types/cookie-consent';
import { userService } from '@/server/services';
import {
    assertAuthenticated,
    validatePayload,
    withAuth,
    makeHandler,
    ok,
    readJson
} from '@/server/utils/reqwest';
import { RequestContext } from '@/server/utils/reqwest/context';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { generateProofHash } from '@/server/utils/crypto';
import { serializeConsentContent } from '@/server/utils/consent';
import { ValidationError } from '@/server/error';
import { ApplicationErrorCode } from '@/server/error/codes';
import { registerRouteDocs } from '@/server/utils/api-docs';
import { AuthLevel } from '@/common/types';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const CookieConsentResponseSchema = z.object({
    id: z.string(),
    userId: z.string(),
    consent: z.boolean(),
    version: z.string(),
    userIpAddress: z.string(),
    userAgent: z.string(),
    createdAt: z.string(),
    revokedAt: z.string().nullable(),
    updatedAt: z.string(),
    proofHash: z.string(),
    accepted: z.array(
        z.enum(['essential', 'preferences', 'analytics', 'marketing'])
    )
});

const UserCookieConsentForCreateSchema = z.strictObject({
    consent: z.boolean(),
    version: z.string(),
    createdAt: z.coerce.date(),
    userId: z.string().optional(),
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
 * ! This endpoint is restricted and only accessible to authenticated users.
 *
 * @param request - The incoming Next.js request object.
 * @returns A JSON response with the created user cookie consent.
 */
async function postHandler(request: NextRequest) {
    const userId = assertAuthenticated();

    const rawPayload = await readJson(request);

    const payload = validatePayload(
        UserCookieConsentForCreateSchema,
        rawPayload
    );

    if (payload.userId && payload.userId !== userId.toString()) {
        throw new ValidationError(
            'app.error.bad-request',
            ApplicationErrorCode.MISSING_FIELD
        );
    }

    const userIpAddress = RequestContext.getIp() || '';
    const userAgent = RequestContext.getUserAgent() || '';

    const consentText = serializeConsentContent();

    const proofHash = generateProofHash({
        text: consentText,
        userId,
        timestamp: payload.createdAt,
        accepted: payload.accepted
    });

    const payloadWithServerData: CookieConsentForCreate = {
        ...payload,
        userIpAddress,
        userAgent,
        proofHash
    };

    const cookieConsent = await userService.createUserCookieConsent(
        userId,
        payloadWithServerData
    );

    return ok(cookieConsent);
}

// not rate limited by design
export const POST = makeHandler(postHandler, withAuth);

//|=============================================================================================|//
//?                                        DOCUMENTATION                                        ?//
//|=============================================================================================|//

registerRouteDocs('/api/users/me/cookie-consent', {
    category: 'Users',
    subcategory: 'Compliance',
    POST: {
        summary: 'Save user cookie consent with proof hash.',
        description: `Records a consent decision with a
            tamper-proof hash for GDPR compliance.`,
        auth: AuthLevel.AUTHENTICATED,
        bodySchema: UserCookieConsentForCreateSchema,
        clientUsage: [
            {
                apiClient: 'apiClient.user.createUserCookieConsent',
                hook: 'chqc.user.useCreateUserCookieConsent'
            }
        ],
        responses: {
            200: {
                description: 'Consent saved',
                schema: CookieConsentResponseSchema
            },
            400: 'Validation failed',
            401: 'Not authenticated'
        }
    }
});
