import {
    makeHandler,
    ok,
    readJson,
    validatePayload
} from '@/server/utils/reqwest';
import type { NextRequest } from 'next/server';
import { withRateLimit } from '@/server/utils/rate-limit';
import { z } from 'zod';
import { mailService } from '@/server/services';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const ContactFormSchema = z.strictObject({
    name: z.string().trim().min(1).max(100),
    email: z.email().trim(),
    subject: z.string().trim().min(1).max(200),
    message: z.string().trim().min(1).max(2000)
});

//|=============================================================================================|//
//?                                           HANDLERS                                          ?//
//|=============================================================================================|//

/**
 * Handles POST requests to `/api/contact` to send a contact form submission.
 *
 * ! This endpoint is rate-limited to 3 submissions per hour per IP address.
 *
 * @param request - The incoming Next.js request object containing the contact form data.
 * @returns A JSON response indicating success.
 *
 * - 200: Success, message sent.
 * - 400: Bad Request, if validation fails.
 * - 429: Too Many Requests, if rate limit exceeded.
 * - 500: Internal Server Error, if email sending fails.
 */
async function postHandler(request: NextRequest) {
    const rawPayload = await readJson(request);

    const payload = validatePayload(ContactFormSchema, rawPayload);

    await mailService.sendContactForm(
        payload.name,
        payload.email,
        payload.subject,
        payload.message
    );

    return ok({ success: true });
}

export const POST = makeHandler(
    postHandler,
    withRateLimit({
        maxRequests: 3,
        windowSizeInSeconds: 60 * 60 * 1000 // 1 hour
    })
);
