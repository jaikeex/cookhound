import { withRateLimit } from '@/server/utils/rate-limit/wrapper';
import { withAuth } from '@/server/utils/session/with-auth';
import { authService } from '@/server/services/auth/service';
import { logRequest, logResponse } from '@/server/logger';
import { RequestContext } from '@/server/utils/reqwest/context';
import { handleServerError } from '@/server/utils/reqwest/handleApiError';
import type { NextRequest } from 'next/server';

async function logoutAllHandler(request: NextRequest) {
    return RequestContext.run(request, async () => {
        try {
            logRequest(request);

            await authService.logoutEverywhere();

            const response = Response.json({ ok: true });

            logResponse(response);

            return response;
        } catch (error: unknown) {
            return handleServerError(error);
        }
    });
}

export const POST = withRateLimit(withAuth(logoutAllHandler), {
    maxRequests: 5,
    windowSizeInSeconds: 60
});
