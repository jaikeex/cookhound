import db from '@/server/db/model';
import { Logger } from '@/server/logger';

//|=============================================================================================|//

const log = Logger.getInstance('recipe-tag-service');

class RecipeTagService {
    async getAll(language: string) {
        log.trace('Getting all tags with categories');

        const tags = await db.recipeTag.getAll(language);

        return tags;
    }
}

export const recipeTagService = new RecipeTagService();
