import {
    makeHandler,
    ok,
    readJson,
    validatePayload
} from '@/server/utils/reqwest';
import { googleApiService } from '@/server/services';
import type { NextRequest } from 'next/server';
import { ENV_CONFIG_PRIVATE } from '@/common/constants';
import { withRateLimit } from '@/server/utils/rate-limit';
import { withAuth } from '@/server/utils/reqwest';
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
    const rawPayload = await readJson(request, { limit: 1024 * 1024 * 5 });

    const payload = validatePayload(RecipeImageSchema, rawPayload);

    await googleApiService.uploadRecipeImage(payload.fileName, payload.bytes);

    // Generate the public URL for the uploaded image
    const bucket = ENV_CONFIG_PRIVATE.GOOGLE_STORAGE_BUCKET_RECIPE_IMAGES;
    const objectUrl = `https://storage.googleapis.com/${bucket}/${payload.fileName}`;

    return ok({ objectUrl });
}

export const POST = makeHandler(
    postHandler,
    withAuth,
    withRateLimit({
        maxRequests: 10,
        windowSizeInSeconds: 600
    })
);
