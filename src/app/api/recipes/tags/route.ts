import type { NextRequest } from 'next/server';
import { recipeTagService } from '@/server/services/recipe-tag/service';
import { DEFAULT_LOCALE } from '@/common/constants';
import { makeHandler, ok } from '@/server/utils/reqwest';
import {
    registerRouteDocs,
    TagListResponseSchema
} from '@/server/utils/api-docs';
import { AuthLevel } from '@/common/types';
import { z } from 'zod';

//|=============================================================================================|//

async function getHandler(request: NextRequest) {
    const language = request.nextUrl.searchParams.get('lang') || DEFAULT_LOCALE;
    const tags = await recipeTagService.getAll(language);

    return ok(tags);
}

export const GET = makeHandler(getHandler);

//|=============================================================================================|//
//?                                        DOCUMENTATION                                        ?//
//|=============================================================================================|//

registerRouteDocs('/api/recipes/tags', {
    category: 'Recipes',
    subcategory: 'Tags',
    GET: {
        summary: 'Get all recipe tags for a language.',
        description: `Grouped by tag category, filtered to the
            requested language.`,
        auth: AuthLevel.PUBLIC,
        clientUsage: [
            { apiClient: 'apiClient.tag.getTags', hook: 'chqc.tag.useTags' }
        ],
        responses: {
            200: {
                description: 'Tag list grouped by category',
                schema: z.array(TagListResponseSchema)
            }
        }
    }
});
