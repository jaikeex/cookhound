import { handleApiError, verifySession } from '@/server/utils';
import { googleService } from '@/server/services/google-api/wrappers';
import type { NextRequest } from 'next/server';
import { ENV_CONFIG_PRIVATE } from '@/common/constants';
import { withRateLimit } from '@/server/utils/rate-limit';
import { HttpError } from '@/common/errors/HttpError';

/**
 * Handles POST requests to `/api/file/recipe-img` to upload a recipe image.
 *
 * ! This endpoint is restricted and only accessible to authenticated users.
 *
 * @returns A JSON response with the uploaded file's object URL.
 */
async function postHandler(request: NextRequest) {
    try {
        const data = await request.json();

        // Check if the user is authenticated.
        if (!(await verifySession())) {
            throw new HttpError('auth.error.unauthorized', 401);
        }

        await googleService.uploadRecipeImage(data.fileName, data.bytes);

        // Generate the public URL for the uploaded image
        const bucket = ENV_CONFIG_PRIVATE.GOOGLE_STORAGE_BUCKET_RECIPE_IMAGES;
        const objectUrl = `https://storage.googleapis.com/${bucket}/${data.fileName}`;

        return Response.json({ objectUrl });
    } catch (error) {
        return handleApiError(error);
    }
}

export const POST = withRateLimit(postHandler, {
    maxRequests: 10,
    windowSizeInSeconds: 600
});
