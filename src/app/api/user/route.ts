import { userService } from '@/server/services';
import type { NextRequest } from 'next/server';
import { handleApiError } from '@/server/utils';

/**
 * Handles GET requests to `/api/user` to fetch users.
 *
 * @returns A JSON response with a list of users.
 * @todo Implement the logic to fetch users.
 */
export async function GET() {
    return Response.json({ message: 'Hello, world!' });
}

/**
 * Handles POST requests to `/api/user` to create a new user.
 *
 * @param request - The incoming Next.js request object containing the user data.
 * @returns A JSON response with the created user object or an error message.
 *
 * - 200: Success, with the created user object.
 * - 400: Bad Request, if the email, password, or username is missing.
 * - 409: Conflict, if the email or username is already taken.
 * - 500: Internal Server Error, if there is another error during user creation.
 */
export async function POST(request: NextRequest) {
    const body = await request.json();

    try {
        const user = await userService.createUser(body);
        return Response.json({ user });
    } catch (error: any) {
        return handleApiError(error);
    }
}

/**
 * Handles PUT requests to `/api/user` to update a user.
 *
 * @returns A JSON response indicating the result of the update operation.
 * @todo Implement the logic to update a user.
 */
export async function PUT() {
    return Response.json({ message: 'Hello, world!' });
}
