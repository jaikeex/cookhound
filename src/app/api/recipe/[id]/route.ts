import { recipeService } from '@/server/services/recipe/service';

/**
 * Handles GET requests to `/api/recipe/{id}` to fetch a specific recipe.
 *
 * @returns A JSON response with the recipe data.
 * @todo Implement the logic to fetch a recipe by its ID.
 */
export async function GET(request: Request) {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (!id || isNaN(Number(id))) {
        return Response.json(
            { error: 'Recipe ID is required and must be a number' },
            { status: 400 }
        );
    }

    const recipe = await recipeService.getRecipeById(Number(id));

    if (!recipe) {
        return Response.json({ error: 'Recipe not found' }, { status: 404 });
    }

    return Response.json(recipe);
}
