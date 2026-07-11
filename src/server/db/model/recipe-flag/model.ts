import type {
    RecipeFlag,
    RecipeFlagAppeal
} from '@/server/db/generated/prisma/client';
import { prisma } from '@/server/integrations';
import { Logger } from '@/server/logger';
import { RecipeFlagAppealStatus } from '@/common/types/flags/recipe-flag-appeal';
import type { RecipeFlagReason } from '@/common/constants';
import { CACHE_TAGS, invalidateTags } from '@/server/db/model/model-cache';

//|=============================================================================================|//

const log = Logger.getInstance('recipe-flag-model');

class RecipeFlagModel {
    //~=========================================================================================~//
    //$                                          QUERIES                                        $//
    //~=========================================================================================~//

    //?—————————————————————————————————————————————————————————————————————————————————————————?//
    //?                                     NO CACHING HERE                                     ?//
    ///
    //# Flag rows are infrequently read (only when an author opens their flagged recipe or
    //# submits an appeal) and must always reflect the latest active state.
    ///
    //?—————————————————————————————————————————————————————————————————————————————————————————?//

    /**
     * Get a single flag by id together with its parent recipe.
     * Query class -> C3
     */
    async getOneById(id: number) {
        log.trace('Getting flag by id', { id });

        return prisma.recipeFlag.findUnique({
            where: { id },
            include: {
                recipe: {
                    select: {
                        id: true,
                        displayId: true,
                        authorId: true,
                        title: true
                    }
                }
            }
        });
    }

    /**
     * Get the currently active flag for a recipe (if any). Only one active
     * flag per recipe is expected.
     * Query class -> C3
     */
    async getActiveByRecipeId(recipeId: number): Promise<RecipeFlag | null> {
        log.trace('Getting active flag for recipe', { recipeId });

        return prisma.recipeFlag.findFirst({
            where: { recipeId, active: true },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Returns the pending appeal for a flag if one exists.
     *
     * Query class -> C3
     */
    async getPendingAppealByFlagId(
        flagId: number
    ): Promise<RecipeFlagAppeal | null> {
        log.trace('Getting pending appeal for flag', { flagId });

        return prisma.recipeFlagAppeal.findFirst({
            where: { flagId, status: RecipeFlagAppealStatus.PENDING }
        });
    }

    /**
     * Count flags that are still open (active and not yet resolved).
     * Query class -> C3
     */
    async countOpen(): Promise<number> {
        log.trace('Counting open flags');

        return prisma.recipeFlag.count({
            where: { active: true, resolved: false }
        });
    }

    //~=========================================================================================~//
    //$                                         MUTATIONS                                       $//
    //~=========================================================================================~//

    /**
     * Create a new appeal in PENDING state for a given flag.
     * Write class -> W3
     */
    async createAppeal(
        flagId: number,
        userId: number,
        message: string
    ): Promise<RecipeFlagAppeal> {
        log.trace('Creating appeal', { flagId, userId });

        return prisma.recipeFlagAppeal.create({
            data: {
                flagId,
                userId,
                message,
                status: RecipeFlagAppealStatus.PENDING
            }
        });
    }

    /**
     * Flag a recipe with the provided reason. Any pre-existing active flag
     * on the same recipe is deactivated first.
     * Write class -> W1
     */
    async flagRecipe(
        recipeId: number,
        recipeDisplayId: string,
        userId: number,
        reason: RecipeFlagReason
    ): Promise<void> {
        log.trace('Flagging a recipe', { recipeId, userId, reason });

        await prisma.$transaction(async (tx) => {
            await tx.recipeFlag.updateMany({
                where: { recipeId, active: true },
                data: {
                    active: false,
                    resolved: true,
                    resolvedAt: new Date()
                }
            });

            await tx.recipeFlag.create({
                data: {
                    recipeId,
                    userId,
                    reason
                }
            });
        });

        await invalidateTags([
            CACHE_TAGS.recipe.entity(recipeId),
            CACHE_TAGS.recipe.byDisplayId(recipeDisplayId)
        ]);
    }

    /**
     * Resolve and deactivate all currently active flags for a recipe.
     * Write class -> W1
     */
    async clearActiveFlags(
        recipeId: number,
        recipeDisplayId: string
    ): Promise<number> {
        log.trace('Clearing active flags for recipe', { recipeId });

        const result = await prisma.recipeFlag.updateMany({
            where: { recipeId, active: true },
            data: {
                active: false,
                resolved: true,
                resolvedAt: new Date()
            }
        });

        if (result.count > 0) {
            await invalidateTags([
                CACHE_TAGS.recipe.entity(recipeId),
                CACHE_TAGS.recipe.byDisplayId(recipeDisplayId)
            ]);
        }

        return result.count;
    }
}

const recipeFlagModel = new RecipeFlagModel();
export default recipeFlagModel;
