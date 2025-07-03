import { BaseJob } from '@/server/queues/BaseJob';
import type { RecipeForEvaluation } from '@/server/services/openai-api/types';
import { JOB_NAMES, QUEUE_NAMES } from '@/server/queues/jobs/names';
import { EVALUATION_QUEUE_OPTIONS } from './constants';
import { queueManager } from '@/server/queues/QueueManager';
import type { Job } from 'bullmq';
import { openaiClient } from '@/server/integrations';
import { Logger } from '@/server/logger';
import recipeModel from '@/server/db/model/recipe/model';
import { InfrastructureError } from '@/server/error/server';
import { InfrastructureErrorCode } from '@/server/error/codes';
import { ENV_CONFIG_PUBLIC, RecipeFlagReason } from '@/common/constants';
import { zodTextFormat } from 'openai/helpers/zod';
import { z } from 'zod';

const log = Logger.getInstance('recipe-evaluation-worker');

type EvaluateRecipeJobData = {
    data: RecipeForEvaluation;
    userId: number;
    recipeId: number;
    recipeDisplayId: string;
};

const EvaluationResponse = z.object({
    accepted: z.boolean(),
    reason: z
        .enum(Object.values(RecipeFlagReason) as [string, ...string[]])
        .nullable()
});

class EvaluateRecipeJob extends BaseJob<EvaluateRecipeJobData> {
    static jobName = JOB_NAMES.EVALUATE_RECIPE;
    static queueName = QUEUE_NAMES.RECIPE_EVALUATION;
    static queueOptions = EVALUATION_QUEUE_OPTIONS;

    //|-----------------------------------------------------------------------------------------|//
    //?                                       JOB HANDLER                                       ?//
    //|-----------------------------------------------------------------------------------------|//

    async handle(job: Job<EvaluateRecipeJobData>) {
        const { data: recipe, userId, recipeId, recipeDisplayId } = job.data;

        log.trace('handle - evaluating recipe', { recipeId, userId });

        try {
            const evaluationResponse = await this.evaluateRecipeWithAI(recipe);

            if (evaluationResponse.accepted) {
                log.notice('handle - recipe accepted', {
                    recipeId,
                    userId
                });
                return;
            }

            const reason = evaluationResponse.reason as RecipeFlagReason;

            if (!reason) {
                log.warn('handle - recipe rejected but no reason provided', {
                    recipeId,
                    userId,
                    evaluationResponse
                });
                return;
            }

            await recipeModel.flagRecipe(recipeId, userId, reason);

            const response = await fetch(
                `${ENV_CONFIG_PUBLIC.API_URL}/revalidate?path=/recipes/display/${recipeDisplayId}`
            );

            if (!response.ok) {
                log.warn('handle - failed to revalidate recipe route', {
                    recipeId,
                    userId,
                    response
                });
            }

            log.notice('handle - recipe rejected and flagged', {
                recipeId,
                userId,
                reason
            });
        } catch (error: unknown) {
            log.warn('handle - failed to evaluate recipe', {
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
    //|-----------------------------------------------------------------------------------------|//
    //?                                        AI REQUEST                                       ?//
    //|-----------------------------------------------------------------------------------------|//

    private async evaluateRecipeWithAI(
        recipe: RecipeForEvaluation
    ): Promise<{ accepted: boolean; reason: RecipeFlagReason | null }> {
        const prompt = this.buildPrompt(recipe);

        const response = await openaiClient.responses.parse({
            model: 'gpt-4.1-mini',
            temperature: 0,

            text: {
                format: zodTextFormat(EvaluationResponse, 'RecipeEvaluation')
            },
            input: [
                {
                    role: 'system',
                    content: `You are a professional content moderator for a family-friendly recipe sharing website. 
                        Your job is to strictly evaluate user-submitted recipes and decide if they are suitable for publication. 
                        A recipe must be:
                        - Family-friendly (no profanity, hate speech, or inappropriate content)
                        - Safe to prepare (no dangerous, illegal, or harmful instructions)
                        - Complete and clear (all steps and ingredients present, instructions make sense)
                        - Not spam or nonsensical (no gibberish, trolling, or irrelevant content)

                        If a recipe fails any of these criteria, reject it and select the most appropriate reason 
                        from the following enum values (with explanattory comments):

                        'not_a_recipe'
                            - The recipe is not a recipe. This means that the recipe's instructions either do
                            - not make sense at all or describe something else entirely besides cooking a meal.

                        'profanity'
                            - The recipe contains profanity. 

                        'hate_speech'
                            - The recipe contains any form of hate speech towards any group of people.

                        'harassment'
                            - The recipe contains any form of harassment towards any person.

                        'violent_content'
                            - The recipe contains any description of violent content.

                        'self_harm'
                            - The recipe contains any description of self-harm.

                        'illegal_activity'
                            - The recipe contains any description of an activity that is considered illegal in most societies.

                        'dangerous_instruction'
                            - The recipe contains dangerous instructions. For example, drinking bleach or
                            - eating glass are dangerous instructions.

                        'personal_info'
                            - The recipe contains information that could lead to an identification of any
                            - person, creator of the recipe or otherwise. This includes things like emails,
                            - names, addresses etc. This does not include things like describing someone's
                            - experiences or the kitchen they have.

                        'spam'
                            - The recipe is spam, advertisement or any other similar form of obtrusive content.

                        Carefully review the recipe's title, ingredients, and instructions.
                        If the recipe is acceptable, set "accepted" to true and "reason" to null.
                        If the recipe is not acceptable, set "accepted" to false and "reason" to the most fitting enum value.
                        Always return a single, valid JSON object matching this schema:
                        {"accepted": boolean, "reason": string | null}

                        If "accepted" is true, "reason" must be null. If "accepted" is false, "reason" must be one of the enum values above.

                        Examples:
                        Input: Recipe with clear instructions, no offensive content, and all required fields.
                        Output: {"accepted": true, "reason": null}

                        Input: Recipe with the instruction "Fuck it".
                        Output: {"accepted": false, "reason": "profanity"}

                        Input: Recipe with nonsensical steps or only gibberish.
                        Output: {"accepted": false, "reason": "not_a_recipe"}

                        Input: Recipe instructs to use dangerous chemicals.
                        Output: {"accepted": false, "reason": "dangerous"}`
                },
                {
                    role: 'user',
                    content: prompt
                }
            ]
        });

        const parsed = response.output_parsed;

        return {
            accepted: parsed?.accepted ?? false,
            reason: parsed?.reason as RecipeFlagReason
        };
    }

    private buildPrompt(recipe: RecipeForEvaluation): string {
        return JSON.stringify({ recipe });
    }
}

queueManager.registerJob(new EvaluateRecipeJob().getDefinition());
