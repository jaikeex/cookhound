import { cachePrismaQuery, generateCacheKey } from '@/server/db/cache';
import prisma from '@/server/db/prisma';
import type { Prisma, Recipe } from '@prisma/client';
import { getRecipeById } from '@prisma/client/sql';

class RecipeModel {
    // ***************************************************************************************** //
    // ?                                         QUERIES                                       ? //
    // ***************************************************************************************** //¨

    async getOneById(
        id: number,
        ttl?: number
    ): Promise<getRecipeById.Result | null> {
        const cacheKey = generateCacheKey('recipe', 'findUnique', {
            where: { id }
        });

        const recipe = await cachePrismaQuery(
            cacheKey,
            () => prisma.$queryRawTyped(getRecipeById(id)),
            ttl
        );

        return recipe[0];
    }

    // ***************************************************************************************** //
    // ?                                        MUTATIONS                                      ? //
    // ***************************************************************************************** //

    async createOne(data: {
        recipe: Omit<Prisma.RecipeCreateInput, 'instructions' | 'ingredients'>;
        instructions: string[];
        ingredients: { name: string; quantity: string | null }[];
    }): Promise<Recipe> {
        return await prisma.$transaction(async (tx) => {
            const recipe = await tx.recipe.create({
                data: data.recipe
            });

            // Create instructions
            if (data.instructions.length > 0) {
                await tx.instruction.createMany({
                    data: data.instructions.map((text, index) => ({
                        recipeId: recipe.id,
                        step: index + 1,
                        text
                    }))
                });
            }

            // Create ingredients
            if (data.ingredients.length > 0) {
                for (let i = 0; i < data.ingredients.length; i++) {
                    const ingredientData = data.ingredients[i];

                    // Only create ingredient if it doesn't already exist
                    let ingredient = await tx.ingredient.findFirst({
                        where: {
                            name: ingredientData.name,
                            language: (data.recipe as any).language || 'en'
                        }
                    });

                    if (!ingredient) {
                        ingredient = await tx.ingredient.create({
                            data: {
                                name: ingredientData.name,
                                language: (data.recipe as any).language || 'en'
                            }
                        });
                    }

                    // Create recipe-ingredient relation
                    await tx.recipeIngredient.create({
                        data: {
                            recipeId: recipe.id,
                            ingredientId: ingredient.id,
                            quantity: ingredientData.quantity,
                            ingredientOrder: i + 1
                        }
                    });
                }
            }

            return (await tx.recipe.findUnique({
                where: { id: recipe.id },
                include: {
                    ingredients: {
                        include: {
                            ingredient: true
                        }
                    },
                    instructions: true
                }
            })) as Recipe;
        });
    }

    // ***************************************************************************************** //
    // ?                                     PRIVATE METHODS                                   ? //
    // ***************************************************************************************** //
}

const recipeModel = new RecipeModel();
export default recipeModel;
