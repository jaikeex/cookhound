import { verifySessionWithRedirect } from '@/server/utils';

/**
 * Handles POST requests to `/api/recipe` to create a new recipe.
 *
 * ! This endpoint is restricted and only accessible to authenticated users.
 *
 * @returns A JSON response indicating the result of the creation operation.
 * @todo Implement the logic to create a new recipe.
 */
export async function POST() {
    await verifySessionWithRedirect();

    return Response.json({ message: 'Hello, world!' });
}
