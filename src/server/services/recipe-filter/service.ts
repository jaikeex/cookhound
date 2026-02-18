import type {
    Locale,
    RecipeForDisplayDTO,
    RecipeFilterParams
} from '@/common/types';
import db from '@/server/db/model';
import { ValidationError } from '@/server/error';
import { ApplicationErrorCode } from '@/server/error/codes';
import { Logger, LogServiceMethod } from '@/server/logger';

//|=============================================================================================|//

const log = Logger.getInstance('recipe-filter-service');

class RecipeFilterService {
    private readonly MAX_BATCHES = 20;

    /**
     * Return a paginated, filtered set of recipes.
     *
     * All filter dimensions are optional. When a dimension is omitted (or its array
     * is empty) it places no constraint on the results. Semantics per dimension:
     *  - containsIngredients: ALL selected ingredients must be present
     *  - excludesIngredients: NONE of the selected ingredients may be present
     *  - tags: ALL selected tags must be present
     *  - timeMin / timeMax: inclusive range on recipe.time (NULL times are excluded)
     *  - hasImage: when true, only recipes with an imageUrl are returned
     */
    @LogServiceMethod({ names: ['language', 'batch', 'perPage'] })
    async filterRecipes(
        filters: RecipeFilterParams,
        language: Locale,
        batch: number,
        perPage: number
    ): Promise<RecipeForDisplayDTO[]> {
        if (batch < 1 || batch > this.MAX_BATCHES) {
            log.warn('filterRecipes - invalid batch requested', { batch });
            throw new ValidationError(
                undefined,
                ApplicationErrorCode.VALIDATION_FAILED
            );
        }

        if (perPage <= 0 || perPage > 100) {
            log.warn('filterRecipes - invalid perPage requested', { perPage });
            throw new ValidationError(
                undefined,
                ApplicationErrorCode.VALIDATION_FAILED
            );
        }

        const offset = (batch - 1) * perPage;

        const results = await db.recipe.filterMany(
            filters,
            language,
            perPage,
            offset
        );

        return results.map((recipe) => ({
            id: recipe.id,
            displayId: recipe.displayId,
            title: recipe.title,
            imageUrl: recipe.imageUrl || '',
            rating: recipe.rating ? Number(recipe.rating) : null,
            timesRated: recipe.timesRated ?? 0,
            time: recipe.time,
            portionSize: recipe.portionSize
        }));
    }
}

export const recipeFilterService = new RecipeFilterService();
