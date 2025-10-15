import { makeHandler, ok } from '@/server/utils/reqwest';
import { readMultipartFile } from '@/server/utils/multipart';
import { googleApiService } from '@/server/services';
import type { NextRequest } from 'next/server';
import { ENV_CONFIG_PRIVATE } from '@/common/constants';
import { withRateLimit } from '@/server/utils/rate-limit';
import { withAuth } from '@/server/utils/reqwest';
import { randomUUID } from 'crypto';

/**
 * Handles POST requests to `/api/file/avatar-img` to upload a avatar image.
 *
 * ! This endpoint is restricted and only accessible to authenticated users.
 *
 * @returns A JSON response with the uploaded file's object URL.
 */
async function postHandler(request: NextRequest) {
    const { data } = await readMultipartFile(request, {
        fieldName: 'avatar-image',
        maxSize: 5 * 1024 * 1024,
        allowedContentTypes: ['image/webp']
    });

    const fileName = `avatar-image-${randomUUID()}.webp`;

    await googleApiService.uploadAvatarImage(fileName, data);

    // Generate the public URL for the uploaded image
    const bucket = ENV_CONFIG_PRIVATE.GOOGLE_STORAGE_BUCKET_AVATAR_IMAGES;
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
