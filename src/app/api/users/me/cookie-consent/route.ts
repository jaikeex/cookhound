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
 * ! This endpoint is restricted and only accessible to authenticated users.
 *
 * @param request - The incoming Next.js request object.
 * @returns A JSON response with the created user cookie consent.
 */
export async function postHandler(request: NextRequest) {
    const userId = assertAuthenticated();

    const rawPayload = await readJson(request);

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
            CONSENT_HASHES[payload.version as keyof typeof CONSENT_HASHES]
    };

    const cookieConsent = await userService.createUserCookieConsent(
        userId,
        payloadWithServerData
    );

    return ok(cookieConsent);
}

export const POST = makeHandler(postHandler, withAuth);
