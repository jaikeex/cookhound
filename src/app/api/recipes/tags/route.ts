import { recipeTagService } from '@/server/services';
import { makeHandler, ok } from '@/server/utils/reqwest';
import {
    registerRouteDocs,
    TagListResponseSchema
} from '@/server/utils/api-docs';
import { AuthLevel } from '@/common/types';
import { z } from 'zod';

//|=============================================================================================|//

async function getHandler() {
    const tags = await recipeTagService.getAll();

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
        summary: 'Get all recipe tags.',
        description: `Grouped by tag category.`,
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
