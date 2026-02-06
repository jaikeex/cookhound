import { prisma } from '@/server/integrations';
import { Logger } from '@/server/logger';
import type { CookbookForCreate } from '@/server/services/cookbook/types';
import type { Cookbook } from '@/server/db/generated/prisma/client';
import {
    CACHE_TTL,
    cachePrismaQuery,
    generateCacheKey,
    invalidateCacheByPattern,
    invalidateModelCache
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
            ttl ?? CACHE_TTL.TTL_2
        );

        return cookbook[0] ?? null;
    }

    async getOneByDisplayId(
        displayId: string
    ): Promise<getCookbookByDisplayId.Result | null> {
        log.trace('Getting cookbook by display id', { displayId });

        // This is intentionally not cached.

        const cookbook = await prisma.$queryRawTyped(
            getCookbookByDisplayId(displayId)
        );

        return cookbook[0] ?? null;
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
            ttl ?? CACHE_TTL.TTL_1
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

        await this.invalidateUserCookbookCache(data.ownerId);

        return await prisma.$transaction(async (tx) => {
            const { _max } = (await tx.cookbook.aggregate({
                where: { ownerId: data.ownerId },
                _max: { ownerOrder: true }
            })) as { _max: { ownerOrder: number | null } };

            const nextPos = Number(_max.ownerOrder ?? 0) + 1;

            const cookbook = await tx.cookbook.create({
                data: {
                    ...data,
                    ownerOrder: nextPos
                }
            });

            return cookbook;
        });
    }

    async deleteOne(id: number): Promise<void> {
        log.trace('Deleting cookbook', { id });
        await prisma.$transaction(async (tx) => {
            await tx.cookbookRecipe.deleteMany({ where: { cookbookId: id } });
            await tx.cookbook.delete({ where: { id } });
        });

        await this.invalidateCookbookCache({ id });
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

        await this.invalidateCookbookCache({ id: cookbookId });
        await this.invalidateUserCookbookCache(userId);
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

        await this.invalidateCookbookCache({ id: cookbookId });
        await this.invalidateUserCookbookCache(userId);
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

        await this.invalidateCookbookCache({ id: cookbookId });
        await this.invalidateUserCookbookCache(userId);
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

        await this.invalidateUserCookbookCache(ownerId);
    }

    //~=========================================================================================~//
    //$                                      PRIVATE METHODS                                    $//
    //~=========================================================================================~//

    private async invalidateCookbookCache(
        changed: Partial<Cookbook>,
        original?: Partial<Cookbook>
    ) {
        await invalidateModelCache('cookbook', changed, original ?? undefined);
    }

    private async invalidateUserCookbookCache(userId: number) {
        const cacheKey = generateCacheKey('cookbook', 'findManyByOwnerId', {
            where: { ownerId: userId }
        });

        await invalidateCacheByPattern(cacheKey);
    }
}

const cookbookModel = new CookbookModel();
export default cookbookModel;
