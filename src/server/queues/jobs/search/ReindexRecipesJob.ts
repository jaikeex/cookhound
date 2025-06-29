import { BaseJob } from '@/server/queues/BaseJob';
import { queueManager } from '@/server/queues/QueueManager';
import { JOB_NAMES, QUEUE_NAMES } from '@/server/queues/jobs/names';
import { Logger } from '@/server/logger';
import type { Job } from 'bullmq';
import { prisma } from '@/server/integrations';
import { recipeSearchIndex } from '@/server/search-index';
import type { RecipeDTO } from '@/common/types';
import type { Locale } from '@/client/locales';

const log = Logger.getInstance('recipe-reindex-job');

// How many recipes to load from DB in one go.
const BATCH_SIZE = 250;

/**
 * Rebuilds the Typesense recipe index from the database. The job iterates over every recipe in batches and upserts
 * the document into Typesense. Because the regular service code already upserts individual recipes on
 * relevant change, this job is NOT intended to run real time, but as a cron with reasonable schedule (24 hours)
 */
class ReindexRecipesJob extends BaseJob {
    // Queue/Job identifiers ----------------------------------------------------

    static jobName = JOB_NAMES.REINDEX_RECIPES;
    static queueName = QUEUE_NAMES.SEARCH;

    // A single worker is sufficient – the fetches are sequential anyway.
    static concurrency = 1;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async handle(_job: Job): Promise<void> {
        log.info('handle - starting full recipe re-index run');

        let lastId = 0;
        let totalProcessed = 0;

        // eslint-disable-next-line no-constant-condition
        while (true) {
            const recipes = await prisma.recipe.findMany({
                where: {
                    id: {
                        gt: lastId
                    }
                },
                orderBy: {
                    id: 'asc'
                },
                take: BATCH_SIZE,
                include: {
                    ingredients: {
                        include: {
                            ingredient: true
                        },
                        orderBy: {
                            ingredientOrder: 'asc'
                        }
                    },
                    instructions: {
                        orderBy: {
                            step: 'asc'
                        }
                    }
                }
            });

            if (recipes.length === 0) {
                break;
            }

            for (const recipe of recipes) {
                const dto: RecipeDTO = {
                    id: recipe.id,
                    displayId: recipe.displayId,
                    title: recipe.title,
                    authorId: recipe.authorId,
                    language: recipe.language as Locale,
                    time: recipe.time,
                    portionSize: recipe.portionSize,
                    notes: recipe.notes,
                    imageUrl: recipe.imageUrl ?? '',
                    rating: recipe.rating ? Number(recipe.rating) : null,
                    timesRated: recipe.timesRated ?? 0,
                    timesViewed: recipe.timesViewed ?? 0,
                    ingredients: recipe.ingredients.map((ri) => ({
                        id: ri.ingredientId,
                        name: ri.ingredient.name,
                        quantity: ri.quantity
                    })),
                    instructions: recipe.instructions.map((ins) => ins.text)
                };

                try {
                    await recipeSearchIndex.upsert(dto);
                } catch (error: unknown) {
                    // Do not crash the whole batch – log and continue. The job will run again
                    // later, so a temporary Typesense outage is acceptable.
                    log.errorWithStack(
                        'handle - failed to upsert recipe',
                        error,
                        {
                            recipeId: recipe.id
                        }
                    );
                }
            }

            totalProcessed += recipes.length;
            lastId = recipes[recipes.length - 1].id;
        }

        log.notice('Recipe re-index job finished', {
            totalProcessed
        });
    }
}

// Register the job with the manager so that workers can process it.
queueManager.registerJob(new ReindexRecipesJob().getDefinition());
