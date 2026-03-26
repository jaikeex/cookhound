import { ValidationError } from '@/server/error';
import { ApplicationErrorCode } from '@/server/error/codes';
import { userService } from '@/server/services';
import {
    assertAuthenticated,
    withAuth,
    makeHandler,
    ok,
    assertSelfOrAdmin
} from '@/server/utils/reqwest';
import type { NextRequest } from 'next/server';
import { registerRouteDocs } from '@/server/utils/api-docs';
import { AuthLevel } from '@/common/types';
import { z } from 'zod';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const ConsentVerifyResponseSchema = z.object({
    valid: z.boolean(),
    details: z.object({
        version: z.string(),
        createdAt: z.string(),
        verified: z.string(),
        accepted: z.array(z.string()),
        storedHash: z.string(),
        computedHash: z.string().optional()
    })
});

//|=============================================================================================|//
//?                                          HANDLERS                                           ?//
//|=============================================================================================|//

/**
 * Handles GET requests to `/api/users/me/cookie-consent/[id]/verify` to verify
 * the proof hash of a cookie consent record.
 *
 * ! This endpoint is restricted and only accessible to authenticated users.
 * ! Users can only verify their own cookie consent records.
 *
 * @param request - The incoming Next.js request object.
 * @param params - Route parameters containing the cookie consent ID.
 * @returns A JSON response with the verification result.
 */
async function getHandler(request: NextRequest) {
    const userId = assertAuthenticated();

    const id = request.nextUrl.pathname.split('/').at(-2);

    if (!id || isNaN(Number(id))) {
        throw new ValidationError(
            'app.error.bad-request',
            ApplicationErrorCode.MISSING_FIELD
        );
    }

    const consentId = Number(id);

    if (isNaN(consentId)) {
        throw new Error('Invalid cookie consent ID');
    }

    assertSelfOrAdmin(consentId);

    const verificationResult = await userService.verifyCookieConsentHash(
        userId,
        consentId
    );

    return ok({
        valid: verificationResult.valid,
        version: verificationResult.details.version,
        createdAt: verificationResult.details.createdAt,
        verified: verificationResult.details.verified,
        accepted: verificationResult.details.accepted,
        ...(verificationResult.valid
            ? {}
            : {
                  storedHash: verificationResult.details.storedHash,
                  computedHash: verificationResult.details.computedHash
              })
    });
}

export const GET = makeHandler(getHandler, withAuth);

//|=============================================================================================|//
//?                                        DOCUMENTATION                                        ?//
//|=============================================================================================|//

registerRouteDocs('/api/users/me/cookie-consent/{id}/verify', {
    category: 'Users',
    subcategory: 'Compliance',
    GET: {
        summary: 'Verify the integrity of a cookie consent record.',
        description: `Checks that the consent record has not been
            tampered with.`,
        auth: AuthLevel.AUTHENTICATED,
        responses: {
            200: {
                description: 'Verification result with hash comparison',
                schema: ConsentVerifyResponseSchema
            },
            401: 'Not authenticated',
            403: 'Not authorized'
        }
    }
});
