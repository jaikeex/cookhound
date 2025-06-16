import { handleApiError } from '@/server/utils';
import { uploadRecipeImage } from '@/server/services/google-api';
import type { NextRequest } from 'next/server';
import { ENV_CONFIG_PRIVATE } from '@/common/constants';

/**
 * Handles POST requests to `/api/file/recipe-img` to upload a recipe image.
 *
 * ! This endpoint is restricted and only accessible to authenticated users.
 *
 * @returns A JSON response with the uploaded file's object URL.
 */
export async function POST(request: NextRequest) {
    const data = await request.json();

    try {
        await uploadRecipeImage(data.fileName, data.bytes);
    } catch (error) {
        return handleApiError(error);
    }

    // Generate the public URL for the uploaded image
    const bucket = ENV_CONFIG_PRIVATE.GOOGLE_STORAGE_BUCKET_RECIPE_IMAGES;
    const objectUrl = `https://storage.googleapis.com/${bucket}/${data.fileName}`;

    return Response.json({ objectUrl });
}
