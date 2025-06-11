import { apiRequestWrapper } from '@/client/request/ApiRequestWrapper';
import type { UserForCreatePayload } from '@/common/types';

/**
 * Service for user-related operations.
 */
class UserApiClient {
    /**
     * Creates a new user by calling `POST /api/user`.
     *
     * @param data - The user data for creation.
     * @param next - Optional Next.js fetch request configuration.
     * @returns A promise that resolves when the user is created.
     * - 200: Success, with the created user object.
     *
     * @throws {Error} Throws an error if the request fails.
     * - 400: Bad Request, if the email, password, or username is missing.
     * - 409: Conflict, if the email or username is already taken.
     * - 500: Internal Server Error, if there is another error during user creation.
     */
    async createUser(
        data: UserForCreatePayload,
        next?: NextFetchRequestConfig
    ): Promise<void> {
        await apiRequestWrapper.post({ url: '/user', data, next });
    }

    /**
     * Verifies a user's email address by calling `PUT /api/user/verify-email`.
     *
     * @param token - The verification token from the email.
     * @param next - Optional Next.js fetch request configuration.
     * @returns A promise that resolves when the email is verified.
     * @throws {Error} Throws an error if the request fails.
     * - 200: Success, with a success message.
     *
     * @throws {Error} Throws an error if the request fails.
     * - 400: Bad Request, if the token is missing.
     * - 403: Forbidden, if the email is already verified.
     * - 404: Not Found, if the user is not found.
     * - 500: Internal Server Error, if there is another error during email verification.
     */
    async verifyEmail(
        token: string,
        next?: NextFetchRequestConfig
    ): Promise<void> {
        await apiRequestWrapper.put({
            url: '/user/verify-email',
            params: { token },
            next
        });
    }

    /**
     * Resends a verification email by calling `POST /api/user/verify-email`.
     *
     * @param email - The email address to resend the verification link to.
     * @param next - Optional Next.js fetch request configuration.
     * @returns A promise that resolves when the email is sent.
     * @throws {Error} Throws an error if the request fails.
     */
    async resendVerificationEmail(
        email: string,
        next?: NextFetchRequestConfig
    ): Promise<void> {
        await apiRequestWrapper.post({
            url: '/user/verify-email',
            data: { email },
            next
        });
    }
}

export const userApiClient = new UserApiClient();
