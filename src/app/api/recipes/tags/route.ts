import type { NextRequest } from 'next/server';
import { recipeTagService } from '@/server/services/recipe-tag/service';
import { DEFAULT_LOCALE } from '@/common/constants';
import { makeHandler, ok } from '@/server/utils/reqwest';

//|=============================================================================================|//

async function getHandler(request: NextRequest) {
    const language = request.nextUrl.searchParams.get('lang') || DEFAULT_LOCALE;
    const tags = await recipeTagService.getAll(language);

    return ok(tags);
}

export const GET = makeHandler(getHandler);
