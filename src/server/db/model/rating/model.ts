import type { Prisma, Rating } from '@prisma/client';
import { prisma } from '@/server/integrations';
import { Logger } from '@/server/logger';

//|=============================================================================================|//

const log = Logger.getInstance('rating-model');

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

    /**
     * Get a rating by user id and recipe id
     * Query class -> C3
     */
    async getOneByUserIdAndRecipeId(
        userId: number,
        recipeId: number
    ): Promise<Rating | null> {
        log.trace('Getting rating for user and recipe', {
            userId,
            recipeId
        });

        return prisma.rating.findUnique({
            where: {
                unique_recipe_user: {
                    recipeId: recipeId,
                    userId: userId
                }
            }
        });
    }

    /**
     * Get all ratings for a recipe
     * Query class -> C3
     */
    async getAllByRecipeId(recipeId: number): Promise<Rating[]> {
        log.trace('Getting all ratings for recipe', { recipeId });

        return prisma.rating.findMany({
            where: { recipeId }
        });
    }

    //~=========================================================================================~//
    //$                                         MUTATIONS                                       $//
    //~=========================================================================================~//

    /**
     * Create a new rating
     * Write class -> W3
     */
    async createOne(
        userId: number,
        recipeId: number,
        data: Omit<Prisma.RatingCreateInput, 'user' | 'recipe'>
    ): Promise<Rating> {
        log.trace('Creating rating', {
            userId,
            recipeId,
            rating: data.rating
        });

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

    /**
     * Update a rating
     * Write class -> W1
     */
    async updateOne(
        userId: number,
        recipeId: number,
        data: Omit<Prisma.RatingUpdateInput, 'user' | 'recipe'>
    ): Promise<Rating> {
        log.trace('Updating rating', { userId, recipeId, rating: data.rating });

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
