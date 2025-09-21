import { withRateLimit } from '@/server/utils/rate-limit/wrapper';
import { makeHandler, noContent, withAuth } from '@/server/utils/reqwest';
import { authService } from '@/server/services/auth/service';

async function postHandler() {
    await authService.logoutEverywhere();

    return noContent();
}

export const POST = makeHandler(
    postHandler,
    withAuth,
    withRateLimit({ maxRequests: 5, windowSizeInSeconds: 60 })
);
