import db from '@/server/db/model';
import { Logger } from '@/server/logger';

//|=============================================================================================|//

const log = Logger.getInstance('recipe-tag-service');

class RecipeTagService {
    async getAll() {
        log.trace('Getting all tags with categories');

        const tags = await db.recipeTag.getAll();

        return tags;
    }
}

export const recipeTagService = new RecipeTagService();
