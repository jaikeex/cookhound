import { BaseJob } from '@/server/queues/BaseJob';
import type { Job } from 'bullmq';
import { Logger } from '@/server/logger';
import { queueManager } from '@/server/queues/QueueManager';
import { JOB_NAMES, QUEUE_NAMES } from '@/server/queues/jobs/names';
import { QUEUE_OPTIONS } from './constants';
import db from '@/server/db/model';
import { InfrastructureError } from '@/server/error/server';
import { InfrastructureErrorCode } from '@/server/error/codes';

const log = Logger.getInstance('recipe-visit-worker');

type RecipeVisitJobData = {
    recipeId: number;
    userId: number | null;
};

class RegisterRecipeVisitJob extends BaseJob<RecipeVisitJobData> {
    static jobName = JOB_NAMES.REGISTER_RECIPE_VISIT;
    static queueName = QUEUE_NAMES.RECIPES;
    static queueOptions = QUEUE_OPTIONS;

    async handle(job: Job<RecipeVisitJobData>) {
        const { recipeId, userId } = job.data;

        log.trace('handle - processing recipe visit', { recipeId, userId });

        try {
            if (!recipeId) {
                log.warn('handle - recipeId is required');
                return;
            }

            await db.recipe.incrementViewCount(recipeId);

            log.trace('handle - view count incremented', { recipeId });

            if (userId) {
                await db.user.addRecipeToLastViewed(userId, recipeId);
                log.trace('handle - added to user last viewed', {
                    recipeId,
                    userId
                });
            } else {
                log.trace('handle - skipping last viewed for anonymous user', {
                    recipeId
                });
            }

            log.trace('handle - recipe visit processed successfully', {
                recipeId,
                userId
            });
        } catch (error: unknown) {
            log.warn('handle - failed to process recipe visit', {
                error,
                recipeId,
                userId,
                jobId: job.id
            });
            throw new InfrastructureError(
                InfrastructureErrorCode.QUEUE_JOB_PROCESS_FAILED
            );
        }
    }
}

queueManager.registerJob(new RegisterRecipeVisitJob().getDefinition());
