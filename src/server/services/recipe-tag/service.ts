import db from '@/server/db/model';
import { Logger, LogServiceMethod } from '@/server/logger';

//|=============================================================================================|//

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const log = Logger.getInstance('recipe-tag-service');

class RecipeTagService {
    @LogServiceMethod({ names: ['language'] })
    async getAll(language: string) {
        const tags = await db.recipeTag.getAll(language);

        return tags;
    }
}

export const recipeTagService = new RecipeTagService();
