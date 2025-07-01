import { handleServerError, validatePayload } from '@/server/utils/reqwest';
import { googleApiService } from '@/server/services';
import type { NextRequest } from 'next/server';
import { ENV_CONFIG_PRIVATE } from '@/common/constants';
import { withRateLimit } from '@/server/utils/rate-limit';
import { AuthErrorUnauthorized } from '@/server/error';
import { logRequest, logResponse } from '@/server/logger';
import { RequestContext } from '@/server/utils/reqwest/context';
import { UserRole } from '@/common/types';
import { z } from 'zod';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const RecipeImageSchema = z.strictObject({
    fileName: z.string().trim(),
    bytes: z.array(z.number())
});

//|=============================================================================================|//
//?                                           HANDLERS                                          ?//
//|=============================================================================================|//

/**
 * Handles POST requests to `/api/file/recipe-img` to upload a recipe image.
 *
 * ! This endpoint is restricted and only accessible to authenticated users.
 *
 * @returns A JSON response with the uploaded file's object URL.
 */
async function postHandler(request: NextRequest) {
    return RequestContext.run(request, async () => {
        try {
            logRequest(request);

            const rawPayload = await request.json();

            const payload = validatePayload(RecipeImageSchema, rawPayload);

            // Check if the user is authenticated.
            if (RequestContext.getUserRole() === UserRole.Guest) {
                throw new AuthErrorUnauthorized();
            }

            await googleApiService.uploadRecipeImage(
                payload.fileName,
                payload.bytes
            );

            // Generate the public URL for the uploaded image
            const bucket =
                ENV_CONFIG_PRIVATE.GOOGLE_STORAGE_BUCKET_RECIPE_IMAGES;
            const objectUrl = `https://storage.googleapis.com/${bucket}/${payload.fileName}`;

            const response = Response.json({ objectUrl });

            logResponse(response);
            return response;
        } catch (error: unknown) {
            return handleServerError(error);
        }
    });
}

export const POST = withRateLimit(postHandler, {
    maxRequests: 10,
    windowSizeInSeconds: 600
});
