import { Logger, LogServiceMethod } from '@/server/logger';
import type { RecipeDTO } from '@/common/types';
import { queueManager } from '@/server/queues/QueueManager';
import { JOB_NAMES } from '@/server/queues/jobs/names';
import type { RecipeForEvaluation } from './types';
import { openaiClient } from '@/server/integrations';
import { z } from 'zod';
import { zodTextFormat } from '@/server/utils/openai';
import {
    RECIPE_CATEGORY_TAGS,
    RECIPE_TAG_CATEGORY_LIMITS_BY_NAME
} from '@/common/constants';
import type { RecipeTagDTO } from '@/common/types';
import recipeTagModel from '@/server/db/model/recipe-tag/model';

//|=============================================================================================|//

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const log = Logger.getInstance('openai-api-service');

class OpenAIApiService {
    @LogServiceMethod({ names: ['recipe'] })
    async evaluateRecipeContent(recipe: RecipeDTO) {
        const ingredientsForEvaluation = recipe.ingredients.map((i) => ({
            name: i.name,
            quantity: i.quantity
        }));

        const recipeForEvaluation: RecipeForEvaluation = {
            title: recipe.title,
            language: recipe.language,
            time: recipe.time,
            portionSize: recipe.portionSize,
            ingredients: ingredientsForEvaluation,
            instructions: recipe.instructions,
            notes: recipe.notes
        };

        await queueManager.addJob(JOB_NAMES.EVALUATE_RECIPE, {
            data: recipeForEvaluation,
            userId: recipe.authorId,
            recipeId: recipe.id,
            recipeDisplayId: recipe.displayId
        });

        return;
    }

    //|-------------------------------------------------------------------------------------|//
    //?                               TAG SUGGESTION HELPER                               ?//
    //|-------------------------------------------------------------------------------------|//

    /**
     * Suggests the best fitting tags for a given recipe.
     *
     * This calls the OpenAI model directly (no queue) and asks it to pick tag slugs
     * from our predefined list in `RECIPE_CATEGORY_TAGS` while respecting category
     * limits defined in `RECIPE_TAG_CATEGORY_LIMITS_BY_NAME`.
     *
     * The method then maps the returned slugs to database records and returns them
     * in the `RecipeTagDTO` format expected by the application.
     */
    @LogServiceMethod({ names: ['recipe'] })
    async suggestRecipeTags(recipe: RecipeDTO): Promise<RecipeTagDTO[]> {
        const prompt = this.buildTagSuggestionPrompt(recipe);

        const TagSuggestionResponse = z.object({
            tags: z.array(z.string())
        });

        const response = await openaiClient.responses.parse({
            model: 'gpt-4.1-mini',
            temperature: 0,
            text: {
                format: zodTextFormat(
                    TagSuggestionResponse,
                    'RecipeTagSuggestions'
                )
            },
            input: [
                {
                    role: 'system',
                    content: `You are a helpful culinary assistant that suggests tags for recipes.
                        The recipes users create can be of any type and variety. Your job is to carefully read 
                        through the recipe, and choose the most appropriate tags out of the provided choices.
                        Only choose tags that you are fairly certain will match the recipe. Do not guess
                        or provide unnecessary tags for the sake of it. If no tags match the recipe, or
                        the recipe is nonsensical or contains profanity or hate speech or any other
                        kind of toxic content, simply return no tags.
                    
                        You must ONLY use tag slugs provided in the reference data and must obey 
                        the per-category limits. Return a single JSON object exactly matching the 
                        schema {"tags": string[]} – where each string is a valid tag slug.`
                },
                { role: 'user', content: prompt }
            ]
        });

        const parsed = response.output_parsed;
        const suggestedSlugs: string[] = parsed?.tags ?? [];

        // Map from slug to category for quick lookup
        const slugToCategory: Record<
            string,
            keyof typeof RECIPE_CATEGORY_TAGS
        > = {};

        for (const [category, tags] of Object.entries(RECIPE_CATEGORY_TAGS)) {
            (tags as readonly string[]).forEach((slug) => {
                slugToCategory[slug] =
                    category as keyof typeof RECIPE_CATEGORY_TAGS;
            });
        }

        const categoryCounts: Record<string, number> = {};
        const filteredSlugs: string[] = [];

        for (const slug of suggestedSlugs) {
            const category = slugToCategory[slug];
            if (!category) {
                continue;
            }

            const limit =
                (RECIPE_TAG_CATEGORY_LIMITS_BY_NAME as Record<string, number>)[
                    category
                ] || 0;

            const current = categoryCounts[category] ?? 0;

            if (current < limit && !filteredSlugs.includes(slug)) {
                filteredSlugs.push(slug);
                categoryCounts[category] = current + 1;
            }
        }

        const dbTags = await recipeTagModel.getManyBySlugs(
            filteredSlugs,
            recipe.language
        );

        if (filteredSlugs.length === 0) {
            return [];
        }

        // Preserve the order suggested by the model
        const tagMap = new Map(dbTags.map((t) => [t.name, t]));

        const result: RecipeTagDTO[] = Array.from(tagMap.values()).map(
            (tag) => ({
                id: tag?.id ?? 0,
                name: tag?.name ?? '',
                categoryId: tag?.categoryId ?? 0
            })
        );

        return result;
    }

    //|-------------------------------------------------------------------------------------|//
    //?                                  PROMPT BUILDERS                                   ?//
    //|-------------------------------------------------------------------------------------|//

    private buildTagSuggestionPrompt(recipe: RecipeDTO): string {
        return JSON.stringify({
            recipe: {
                title: recipe.title,
                ingredients: recipe.ingredients,
                instructions: recipe.instructions,
                notes: recipe.notes
            },
            availableTags: RECIPE_CATEGORY_TAGS,
            categoryLimits: RECIPE_TAG_CATEGORY_LIMITS_BY_NAME
        });
    }
}

export const openaiApiService = new OpenAIApiService();
