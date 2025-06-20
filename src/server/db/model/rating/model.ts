import type { Prisma, Rating } from '@prisma/client';
import prisma from '@/server/db/prisma';

class RatingModel {
    //~=========================================================================================~//
    //$                                          QUERIES                                        $//
    //~=========================================================================================~//

    //?—————————————————————————————————————————————————————————————————————————————————————————?//
    //?                                     NO CACHING HERE                                     ?//
    ///
    //# None of these queries are cached on purpose.
    //# The recalculation of the average rating on every user input and also the checks for
    //# wheter a user has already rated would require almost constant cache invalidations,
    //# which would defeat the whole purpose.
    //#
    //# Caching might make sense for additional queries in the future...
    ///
    //?—————————————————————————————————————————————————————————————————————————————————————————?//

    async getOneByUserIdAndRecipeId(
        userId: number,
        recipeId: number
    ): Promise<Rating | null> {
        return prisma.rating.findUnique({
            where: {
                unique_recipe_user: {
                    recipeId: recipeId,
                    userId: userId
                }
            }
        });
    }

    async getAllByRecipeId(recipeId: number): Promise<Rating[]> {
        return prisma.rating.findMany({
            where: { recipeId }
        });
    }

    //~=========================================================================================~//
    //$                                         MUTATIONS                                       $//
    //~=========================================================================================~//

    async createOne(
        userId: number,
        recipeId: number,
        data: Omit<Prisma.RatingCreateInput, 'user' | 'recipe'>
    ): Promise<Rating> {
        const rating = await prisma.rating.create({
            data: {
                ...data,
                user: {
                    connect: {
                        id: userId
                    }
                },
                recipe: {
                    connect: {
                        id: recipeId
                    }
                }
            }
        });

        return rating;
    }

    async updateOne(
        userId: number,
        recipeId: number,
        data: Omit<Prisma.RatingUpdateInput, 'user' | 'recipe'>
    ): Promise<Rating> {
        const rating = await prisma.rating.update({
            where: {
                unique_recipe_user: {
                    recipeId: recipeId,
                    userId: userId
                }
            },
            data
        });

        return rating;
    }

    //~=========================================================================================~//
    //$                                      PRIVATE METHODS                                    $//
    //~=========================================================================================~//
}

const ratingModel = new RatingModel();
export default ratingModel;
