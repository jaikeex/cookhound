import { recipeService } from '@/server/services/recipe/service';
import type { NextRequest } from 'next/server';
import { redirect } from 'next/navigation';
import { HttpError } from '@/common/errors/HttpError';
import { handleApiError } from '@/server/utils';

/**
 * Handles GET requests to `/api/recipe/{id}` to fetch a specific recipe.
 *
 * @returns A JSON response with the recipe data.
 * @todo Implement the logic to fetch a recipe by its ID.
 */
export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (!id || isNaN(Number(id))) {
        return Response.json(
            { error: 'Recipe ID is required and must be a number' },
            { status: 400 }
        );
    }

    try {
        const recipe = await recipeService.getRecipeById(Number(id));

        if (!recipe) {
            return redirect('/not-found');
        }

        return Response.json(recipe);
    } catch (error) {
        if (error instanceof HttpError && error.status === 404) {
            return redirect('/not-found');
        }

        return handleApiError(error);
    }
}
