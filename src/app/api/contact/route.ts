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
import { verifyCaptcha } from '@/server/utils/captcha';
import { registerRouteDocs } from '@/server/utils/api-docs/registry';
import { AuthLevel } from '@/common/types';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const ContactFormSchema = z.strictObject({
    name: z.string().trim().min(1).max(100),
    email: z.email().trim(),
    subject: z.string().trim().min(1).max(200),
    message: z.string().trim().min(1).max(2000),
    captchaToken: z.string().min(1)
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

    await verifyCaptcha(payload.captchaToken, 'contact');

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
        windowSizeInSeconds: 60 * 60 // 1 hour
    })
);

//|=============================================================================================|//
//?                                        DOCUMENTATION                                        ?//
//|=============================================================================================|//

registerRouteDocs('/api/contact', {
    category: 'Contact',
    POST: {
        summary: 'Submit a contact form message.',
        description: `Delivers the message to site administrators
            via email.`,
        auth: AuthLevel.PUBLIC,
        rateLimit: { maxRequests: 3, windowSizeInSeconds: 3600 },
        bodySchema: ContactFormSchema,
        captchaRequired: true,
        clientUsage: [
            {
                apiClient: 'apiClient.contact.submitContactForm',
                hook: 'chqc.contact.useSubmitContactForm'
            }
        ],
        responses: {
            200: 'Message sent',
            400: 'Validation failed',
            429: 'Rate limit exceeded'
        }
    }
});
