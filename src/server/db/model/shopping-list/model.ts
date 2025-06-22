import type {
    ShoppingListIngredientDTO,
    ShoppingListIngredientPayload
} from '@/common/types';
import prisma from '@/server/db/prisma';
import { Logger } from '@/server/logger';

//|=============================================================================================|//

const log = Logger.getInstance('shopping-list-model');

class ShoppingListModel {
    //~=========================================================================================~//
    //$                                          QUERIES                                        $//
    //~=========================================================================================~//

    async getShoppingList(
        userId: number
    ): Promise<ShoppingListIngredientDTO[]> {
        log.trace('Getting shopping list', { userId });

        const shoppingList = await prisma.shoppingListIngredient.findMany({
            where: { userId },
            include: {
                ingredient: true
            },
            orderBy: {
                ingredientOrder: 'asc'
            }
        });

        if (!shoppingList) {
            return [];
        }

        return shoppingList.map((item) => ({
            recipeId: item.recipeId,
            id: item.ingredientId,
            name: item.ingredient.name,
            quantity: item.quantity,
            marked: item.marked
        }));
    }

    //~=========================================================================================~//
    //$                                         MUTATIONS                                       $//
    //~=========================================================================================~//

    /**
     * Adds all data to the current shopping list, updating and marking if necessary.
     * Does not remove anything, only inserts or updates stuff.
     * Does NOT handle reordering - use reorderShoppingList for that.
     */
    async createShoppingList(
        userId: number,
        recipeId: number,
        data: ShoppingListIngredientPayload[]
    ): Promise<ShoppingListIngredientDTO[]> {
        log.trace('Creating/updating shopping list', {
            userId,
            recipeId,
            data
        });

        const shoppingList = await prisma.$transaction(async (tx) => {
            //|---------------------------------------------------------------------------------|//
            //?                                      SETUP                                      ?//
            //|---------------------------------------------------------------------------------|//

            // Get current shopping list items for this user to check for existing ingredients
            const existingItems = await tx.shoppingListIngredient.findMany({
                where: { userId, recipeId },
                select: {
                    ingredientId: true,
                    quantity: true,
                    ingredientOrder: true,
                    marked: true
                }
            });

            // Create a map for quick lookup of existing items
            const existingItemsMap = new Map(
                existingItems.map((item) => [
                    item.ingredientId,
                    {
                        quantity: item.quantity,
                        order: item.ingredientOrder,
                        marked: item.marked
                    }
                ])
            );

            // Get the maximum existing ingredientOrder for this user to avoid conflicts
            const maxOrder = existingItems.reduce(
                (max, item) => Math.max(max, item.ingredientOrder),
                0
            );

            const nextOrder = maxOrder + 1;

            // Process each ingredient using upsert to handle updates and creates
            const upsertPromises = data.map((ingredient, index) => {
                const existing = existingItemsMap.get(ingredient.id);

                //|---------------------------------------------------------------------------------|//
                //?                                   ORDER LOGIC                                   ?//
                //|---------------------------------------------------------------------------------|//

                // For creation/updating, don't reorder - keep existing order or append new items
                // The index addition here can result in gaps in the order, this is not a problem.
                const targetOrder = existing
                    ? existing.order
                    : nextOrder + index;

                //|---------------------------------------------------------------------------------|//
                //?                                   UPDATE CHECK                                  ?//
                //|---------------------------------------------------------------------------------|//

                // Determine if we need to update
                let needsUpdate: boolean = false;

                if (existing && existing.quantity !== ingredient.quantity) {
                    needsUpdate = true;
                }

                if (
                    existing &&
                    ingredient.marked !== undefined &&
                    existing?.marked !== ingredient.marked
                ) {
                    needsUpdate = true;
                }

                //|---------------------------------------------------------------------------------|//
                //?                                      QUERY                                      ?//
                //|---------------------------------------------------------------------------------|//

                return tx.shoppingListIngredient.upsert({
                    where: {
                        userId_ingredientId_recipeId: {
                            userId,
                            ingredientId: ingredient.id,
                            recipeId
                        }
                    },
                    update: needsUpdate
                        ? {
                              quantity: ingredient.quantity,
                              marked: ingredient.marked ?? false
                          }
                        : {},
                    create: {
                        quantity: ingredient.quantity,
                        ingredientId: ingredient.id,
                        userId,
                        recipeId,
                        ingredientOrder: targetOrder,
                        marked: false
                    },
                    include: {
                        ingredient: true
                    }
                });
            });

            //|-------------------------------------------------------------------------------------|//
            //?                                  EXECUTE AND RETURN                                 ?//
            //|-------------------------------------------------------------------------------------|//

            // Execute all upserts
            const upsertedItems = await Promise.all(upsertPromises);

            // Map to the expected return format
            const result: ShoppingListIngredientDTO[] = upsertedItems.map(
                (item) => ({
                    recipeId: item.recipeId,
                    name: item.ingredient.name,
                    id: item.ingredientId,
                    quantity: item.quantity,
                    marked: item.marked
                })
            );

            return result;
        });

        return shoppingList;
    }

    async deleteShoppingList(userId: number, recipeId?: number): Promise<void> {
        log.trace('Deleting shopping list', { userId, recipeId });
        await prisma.shoppingListIngredient.deleteMany({
            where: { userId, recipeId: recipeId ?? undefined }
        });
    }
}

const shoppingListModel = new ShoppingListModel();
export default shoppingListModel;
