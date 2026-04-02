import { makeHandler, ok } from '@/server/utils/reqwest';
import { readMultipartFile } from '@/server/utils/multipart';
import { googleApiService } from '@/server/services';
import type { NextRequest } from 'next/server';
import { ENV_CONFIG_PRIVATE } from '@/common/constants';
import { withRateLimit } from '@/server/utils/rate-limit';
import { withAuth } from '@/server/utils/reqwest';
import { randomUUID } from 'crypto';
import { registerRouteDocs } from '@/server/utils/api-docs/registry';
import { AuthLevel } from '@/common/types';
import { z } from 'zod';

//|=============================================================================================|//
//?                                     RESPONSE SCHEMAS                                        ?//
//|=============================================================================================|//

const FileUploadResponseSchema = z.object({
    objectUrl: z.string()
});

/**
 * Handles POST requests to `/api/file/recipe-img` to upload a recipe image.
 *
 * ! This endpoint is restricted and only accessible to authenticated users.
 *
 * @returns A JSON response with the uploaded file's object URL.
 */
async function postHandler(request: NextRequest) {
    const { data } = await readMultipartFile(request, {
        fieldName: 'recipe-image',
        maxSize: 5 * 1024 * 1024
    });

    const fileName = `recipe-image-${randomUUID()}.webp`;

    await googleApiService.uploadRecipeImage(fileName, data);

    const bucket = ENV_CONFIG_PRIVATE.GOOGLE_STORAGE_BUCKET_RECIPE_IMAGES;
    const objectUrl = `https://storage.googleapis.com/${bucket}/${fileName}`;

    return ok({ objectUrl });
}

export const POST = makeHandler(
    postHandler,
    withAuth,
    withRateLimit({
        maxRequests: 10,
        windowSizeInSeconds: 600 // 10 minutes
    })
);

//|=============================================================================================|//
//?                                        DOCUMENTATION                                        ?//
//|=============================================================================================|//

registerRouteDocs('/api/file/recipe-img', {
    category: 'File Upload',
    subcategory: 'Images',
    POST: {
        summary: 'Upload a recipe image.',
        description: `WebP only.`,
        auth: AuthLevel.AUTHENTICATED,
        rateLimit: { maxRequests: 10, windowSizeInSeconds: 600 },
        requestContentType: 'multipart/form-data',
        clientUsage: [
            {
                apiClient: 'apiClient.file.uploadRecipeImage',
                hook: 'chqc.file.useUploadRecipeImage'
            }
        ],
        responses: {
            200: {
                description: 'Object URL of the uploaded image',
                schema: FileUploadResponseSchema
            },
            401: 'Not authenticated',
            415: 'Unsupported media type',
            429: 'Rate limit exceeded'
        }
    }
});
