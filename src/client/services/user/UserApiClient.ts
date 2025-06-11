import { apiRequestWrapper } from '@/client/services/ApiRequestWrapper';
import type { UserForCreate } from '@/common/types';

/**
 * Service for user-related operations.
 */
class UserApiClient {
    /**
     * Creates a new user.
     *
     * @param data - The user data to create.
     * @param next - The Next.js fetch request configuration.
     *
     * @returns {Promise<void>} The currently logged-in user.
     * @throws {Error} Throws an error if the request fails.
     */
    async createUser(
        data: UserForCreate,
        next?: NextFetchRequestConfig
    ): Promise<void> {
        await apiRequestWrapper.post({ url: '/user', data, next });
    }

    /**
     * Verifies a user's email address.
     *
     * @param token - The verification token.
     * @param next - The Next.js fetch request configuration.
     *
     * @returns {Promise<void>} A promise that resolves when the email is verified.
     * @throws {Error} Throws an error if the request fails.
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
     * Resends a verification email to the user.
     *
     * @param email - The email address to send the verification email to.
     * @param next - The Next.js fetch request configuration.
     *
     * @returns {Promise<void>} A promise that resolves when the email is sent.
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
