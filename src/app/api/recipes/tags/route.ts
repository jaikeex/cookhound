import { RequestContext } from '@/server/utils/reqwest/context';
import { logRequest, logResponse } from '@/server/logger';
import { handleServerError } from '@/server/utils/reqwest';
import type { NextRequest } from 'next/server';
import { recipeTagService } from '@/server/services/recipe-tag/service';

//|=============================================================================================|//

export async function GET(request: NextRequest) {
    return RequestContext.run(request, async () => {
        try {
            logRequest(request);

            const language = request.nextUrl.searchParams.get('lang') || 'en';
            const tags = await recipeTagService.getAll(language);

            const response = Response.json(tags);

            logResponse(response);
            return response;
        } catch (error: unknown) {
            return handleServerError(error);
        }
    });
}
