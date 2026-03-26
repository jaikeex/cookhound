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

const TermsVerifyResponseSchema = z.object({
    valid: z.boolean(),
    details: z.object({
        version: z.string(),
        createdAt: z.string(),
        verified: z.string(),
        storedHash: z.string(),
        computedHash: z.string().optional()
    })
});

//|=============================================================================================|//
//?                                          HANDLERS                                           ?//
//|=============================================================================================|//

/**
 * Handles GET requests to `/api/users/me/terms-acceptance/[id]/verify` to verify
 * the proof hash of a terms acceptance record.
 *
 * ! This endpoint is restricted and only accessible to authenticated users.
 * ! Users can only verify their own terms acceptance records.
 *
 * @param request - The incoming Next.js request object.
 * @param params - Route parameters containing the terms acceptance ID.
 * @returns A JSON response with the verification result.
 */
async function getHandler(request: NextRequest) {
    const userId = assertAuthenticated();

    const id = request.nextUrl.pathname.split('/').pop();

    if (!id || isNaN(Number(id))) {
        throw new ValidationError(
            'app.error.bad-request',
            ApplicationErrorCode.MISSING_FIELD
        );
    }

    const acceptanceId = Number(id);

    if (isNaN(acceptanceId)) {
        throw new Error('Invalid terms acceptance ID');
    }

    assertSelfOrAdmin(acceptanceId);

    const verificationResult = await userService.verifyTermsAcceptanceHash(
        userId,
        acceptanceId
    );

    return ok({
        valid: verificationResult.valid,
        version: verificationResult.details.version,
        createdAt: verificationResult.details.createdAt,
        verified: verificationResult.details.verified,
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

registerRouteDocs('/api/users/me/terms-acceptance/{id}/verify', {
    category: 'Users',
    subcategory: 'Compliance',
    GET: {
        summary: 'Verify the integrity of a terms acceptance record.',
        description: `Checks that the acceptance record has not
            been tampered with.`,
        auth: AuthLevel.AUTHENTICATED,
        responses: {
            200: {
                description: 'Verification result with hash comparison',
                schema: TermsVerifyResponseSchema
            },
            401: 'Not authenticated',
            403: 'Not authorized'
        }
    }
});
