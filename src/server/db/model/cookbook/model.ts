import { prisma } from '@/server/integrations';
import { Logger } from '@/server/logger';
import type { CookbookForCreate } from '@/server/services/cookbook/types';
import type { Cookbook } from '@/server/db/generated/prisma/client';
import {
    CACHE_TAGS,
    CACHE_TTL,
    cachePrismaQuery,
    generateCacheKey,
    invalidateTags
} from '@/server/db/model/model-cache';
import {
    getCookbookById,
    getCookbooksByOwnerId,
    getCookbookByDisplayId
} from '@/server/db/generated/prisma/sql';
import { reorderOwnerCookbooks as reorderOwnerCookbooksSql } from '@/server/db/generated/prisma/sql';
import { reorderCookbookRecipes as reorderCookbookRecipesSql } from '@/server/db/generated/prisma/sql';

//|=============================================================================================|//

const log = Logger.getInstance('cookbook-model');

class CookbookModel {
    //~=========================================================================================~//
    //$                                          QUERIES                                        $//
    //~=========================================================================================~//

    async getOneById(
        id: number,
        ttl?: number
    ): Promise<getCookbookById.Result | null> {
        log.trace('Getting cookbook by id', { id });

        const cacheKey = generateCacheKey('cookbook', 'findUnique', {
            where: { id }
        });

        const cookbook = await cachePrismaQuery(
            cacheKey,
            async () => {
                log.trace('Fetching cookbook from db by id', { id });
                return prisma.$queryRawTyped(getCookbookById(id));
            },
            ttl ?? CACHE_TTL.TTL_2,
            (rows) => [
                CACHE_TAGS.cookbook.entity(id),
                ...this.containsRecipeTags(rows[0])
            ]
        );

        return this.reviveCookbookDates(cookbook[0] ?? null);
    }

    async getOneByDisplayId(
        displayId: string,
        ttl?: number
    ): Promise<getCookbookByDisplayId.Result | null> {
        log.trace('Getting cookbook by display id', { displayId });

        const cacheKey = generateCacheKey('cookbook', 'findByDisplayId', {
            where: { displayId }
        });
        /**
         * Keyed by displayId but tagged with the numeric id so it shares
         * getOneById's invalidation: every writer already drops
         * cookbook.entity(id), so any write clears this entry too.
         *
         * A miss is deliberately not cached (ttl 0). The raw-SQL not-found
         * resolves to [], which would cache and serve like any other value,
         * and this read backs an unauthenticated route keyed by a
         * caller-supplied UUID, so every cached miss would pin a value key
         * plus a tag set per probed id. Skipping the cache also means a
         * not-found can never go stale, so no identity tag is needed for it.
         */
        const cookbook = await cachePrismaQuery(
            cacheKey,
            async () => {
                log.trace('Fetching cookbook from db by display id', {
                    displayId
                });
                return prisma.$queryRawTyped(getCookbookByDisplayId(displayId));
            },
            (rows) => (rows.length === 0 ? 0 : (ttl ?? CACHE_TTL.TTL_2)),
            (rows) =>
                rows[0]
                    ? [
                          CACHE_TAGS.cookbook.entity(rows[0].id),
                          ...this.containsRecipeTags(rows[0])
                      ]
                    : []
        );

        return this.reviveCookbookDates(cookbook[0] ?? null);
    }

    async getManyByOwnerId(
        ownerId: number,
        ttl?: number
    ): Promise<getCookbooksByOwnerId.Result[]> {
        log.trace('Getting many cookbooks by owner id', { ownerId });

        const cacheKey = generateCacheKey('cookbook', 'findManyByOwnerId', {
            where: { ownerId }
        });

        const cookbooks = await cachePrismaQuery(
            cacheKey,
            async () => {
                log.trace('Fetching many cookbooks by owner id from db', {
                    ownerId
                });

                return prisma.$queryRawTyped(getCookbooksByOwnerId(ownerId));
            },
            ttl ?? CACHE_TTL.TTL_1,
            [CACHE_TAGS.cookbook.ownedBy(ownerId)]
        );
        return cookbooks;
    }

    //~=========================================================================================~//
    //$                                         MUTATIONS                                       $//
    //~=========================================================================================~//

    async createOne(data: CookbookForCreate): Promise<Cookbook> {
        log.trace('Creating cookbook', {
            title: data.title,
            ownerId: data.ownerId
        });

        const cookbook = await prisma.$transaction(async (tx) => {
            const { _max } = (await tx.cookbook.aggregate({
                where: { ownerId: data.ownerId },
                _max: { ownerOrder: true }
            })) as { _max: { ownerOrder: number | null } };

            const nextPos = Number(_max.ownerOrder ?? 0) + 1;

            return tx.cookbook.create({
                data: {
                    ...data,
                    ownerOrder: nextPos
                }
            });
        });

        //?—————————————————————————————————————————————————————————————————————————————————————?//
        //?                         WHY A CREATE DROPS ITS OWN IDENTITY                         ?//
        ///
        //# Invalidate AFTER the transaction commits, otherwise a concurrent reader can
        //# repopulate the entry with pre-write data and it survives its full ttl.
        //#
        //# The entity tag is dropped even though the row is brand new: getOneById resolves
        //# a miss to [], which caches and serves like any other value, so a pre-creation
        //# probe of this id may have cached a not-found. Leaving it in place would 404 the
        //# freshly created cookbook for the rest of its ttl.
        ///
        //?—————————————————————————————————————————————————————————————————————————————————————?//

        await invalidateTags([
            CACHE_TAGS.cookbook.ownedBy(data.ownerId),
            CACHE_TAGS.cookbook.entity(cookbook.id)
        ]);

        return cookbook;
    }

    async deleteOne(id: number): Promise<void> {
        log.trace('Deleting cookbook', { id });

        // Capture the owner before the row is gone so their cookbook collection
        // (getManyByOwnerId) can also be cleared from the cache, otherwise the
        // owner's list would show the deleted cookbook until its ttl elapses.
        const cookbook = await prisma.cookbook.findUnique({
            where: { id },
            select: { ownerId: true }
        });

        await prisma.$transaction(async (tx) => {
            await tx.cookbookBookmark.deleteMany({ where: { cookbookId: id } });
            await tx.cookbookRecipe.deleteMany({ where: { cookbookId: id } });
            await tx.cookbook.delete({ where: { id } });
        });

        await invalidateTags([
            CACHE_TAGS.cookbook.entity(id),
            ...(cookbook ? [CACHE_TAGS.cookbook.ownedBy(cookbook.ownerId)] : [])
        ]);
    }

    /**
     * Insert a recipe into a cookbook.  If position is provided (starts at 1), the recipe will be
     * placed there and every recipe at/after that position will be shifted down by one.
     * Otherwise, the recipe will be inserted at the end.
     */
    async addRecipeToCookbook(
        cookbookId: number,
        recipeId: number,
        userId: number,
        position?: number
    ): Promise<void> {
        log.trace('Adding recipe to cookbook', {
            cookbookId,
            recipeId,
            position
        });

        await prisma.$transaction(async (tx) => {
            let targetPos: number;

            if (typeof position === 'number' && position > 0) {
                targetPos = position;

                // Shift all recipes at or after the desired position up by 1
                await tx.cookbookRecipe.updateMany({
                    where: {
                        cookbookId,
                        recipeOrder: {
                            gte: targetPos
                        }
                    },
                    data: {
                        recipeOrder: {
                            increment: 1
                        }
                    }
                });
            } else {
                // Append → next position = current max + 1
                const { _max } = await tx.cookbookRecipe.aggregate({
                    where: { cookbookId },
                    _max: { recipeOrder: true }
                });

                const currentMax = Number(_max.recipeOrder ?? 0);
                targetPos = currentMax + 1;
            }

            await tx.cookbookRecipe.create({
                data: {
                    cookbookId,
                    recipeId,
                    recipeOrder: targetPos
                }
            });
        });

        await invalidateTags([
            CACHE_TAGS.cookbook.entity(cookbookId),
            CACHE_TAGS.cookbook.ownedBy(userId)
        ]);
    }

    /**
     * Remove a recipe from a cookbook and compact the order column so that it stays continuous.
     */
    async removeRecipeFromCookbook(
        cookbookId: number,
        recipeId: number,
        userId: number
    ): Promise<void> {
        log.trace('Removing recipe from cookbook', {
            cookbookId,
            recipeId
        });

        await prisma.$transaction(async (tx) => {
            const deleted = await tx.cookbookRecipe.delete({
                where: {
                    cookbookId_recipeId: { cookbookId, recipeId }
                },
                select: {
                    recipeOrder: true
                }
            });

            const deletedPos = Number(deleted.recipeOrder);

            await tx.cookbookRecipe.updateMany({
                where: {
                    cookbookId,
                    recipeOrder: {
                        gt: deletedPos
                    }
                },
                data: {
                    recipeOrder: {
                        decrement: 1
                    }
                }
            });
        });

        await invalidateTags([
            CACHE_TAGS.cookbook.entity(cookbookId),
            CACHE_TAGS.cookbook.ownedBy(userId)
        ]);
    }

    /**
     * Re-order the recipes in a cookbook according to the provided list.
     */
    async reorderCookbookRecipes(
        cookbookId: number,
        orderedRecipeIds: ReadonlyArray<number>,
        userId: number
    ): Promise<void> {
        if (orderedRecipeIds.length === 0) return;

        log.trace('Reordering cookbook recipes', {
            cookbookId,
            orderedRecipeIds
        });

        await prisma.$transaction(async (tx) => {
            await tx.$queryRawTyped(
                reorderCookbookRecipesSql(
                    cookbookId,
                    orderedRecipeIds as number[]
                )
            );
        });

        await invalidateTags([
            CACHE_TAGS.cookbook.entity(cookbookId),
            CACHE_TAGS.cookbook.ownedBy(userId)
        ]);
    }

    /**
     * Re-order all cookbooks owned by a user according to the provided list.
     */
    async reorderOwnCookbooks(
        ownerId: number,
        orderedCookbookIds: ReadonlyArray<number>
    ): Promise<void> {
        if (orderedCookbookIds.length === 0) return;

        log.trace('Reordering owner cookbooks', {
            ownerId,
            orderedCookbookIds
        });

        await prisma.$transaction(async (tx) => {
            await tx.$queryRawTyped(
                reorderOwnerCookbooksSql(
                    ownerId,
                    orderedCookbookIds as number[]
                )
            );
        });

        await invalidateTags([CACHE_TAGS.cookbook.ownedBy(ownerId)]);
    }

    //~=========================================================================================~//
    //$                                          HELPERS                                        $//
    //~=========================================================================================~//

    /**
     * Cross-model tags for the recipe cards embedded in a cookbook entity
     * payload. Registering one containsRecipe tag per embedded recipe lets
     * recipe.updateOneById / deleteOneById clear every cookbook entry that
     * renders the touched recipe.
     */
    private containsRecipeTags(
        row: { recipes: unknown } | undefined
    ): readonly string[] {
        const recipes = row?.recipes;

        if (!Array.isArray(recipes)) {
            return [];
        }

        return recipes.flatMap((recipe) => {
            const id = (recipe as { id?: unknown } | null)?.id;
            return typeof id === 'number'
                ? [CACHE_TAGS.cookbook.containsRecipe(id)]
                : [];
        });
    }

    private reviveCookbookDates<T extends { createdAt: Date; updatedAt: Date }>(
        cookbook: T | null
    ): T | null {
        if (!cookbook) return null;

        return {
            ...cookbook,
            createdAt: new Date(cookbook.createdAt),
            updatedAt: new Date(cookbook.updatedAt)
        };
    }
}

const cookbookModel = new CookbookModel();
export default cookbookModel;
