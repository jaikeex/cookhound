import type { RequestConfig } from '@/client/request/ApiRequestWrapper';
import { apiRequestWrapper } from '@/client/request/ApiRequestWrapper';
import type {
    DeleteShoppingListPayload,
    ResetPasswordEmailPayload,
    ResetPasswordPayload,
    ShoppingListDTO,
    ShoppingListPayload,
    UserForCreatePayload
} from '@/common/types';

/**
 * Service for user-related operations.
 */
class UserApiClient {
    /**
     * Creates a new user by calling `POST /api/user`.
     *
     * @param data - The user data for creation.
     * @param config - Optional fetch request configuration.
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
        config?: RequestConfig
    ): Promise<void> {
        await apiRequestWrapper.post({ url: '/user', data, ...config });
    }

    /**
     * Gets the shopping list by calling `GET /api/users/{id}/shopping-list`.
     *
     * @param config - Optional fetch request configuration.
     * @returns A promise that resolves when the shopping list is fetched.
     * @throws {Error} Throws an error if the request fails.
     */
    async getShoppingList(
        userId: number,
        config?: RequestConfig
    ): Promise<ShoppingListDTO[]> {
        return await apiRequestWrapper.get({
            url: `/users/${userId}/shopping-list`,
            ...config
        });
    }

    /**
     * Creates a new shopping list by calling `POST /api/users/{id}/shopping-list`.
     *
     * @param data - The shopping list data to create.
     * @param config - Optional fetch request configuration.
     * @returns A promise that resolves when the shopping list is created.
     * @throws {Error} Throws an error if the request fails.
     */
    async upsertShoppingList(
        userId: number,
        data: ShoppingListPayload,
        config?: RequestConfig
    ): Promise<ShoppingListDTO[]> {
        return await apiRequestWrapper.post({
            url: `/users/${userId}/shopping-list`,
            data,
            ...config
        });
    }

    /**
     * Updates the shopping list by calling `PUT /api/users/{id}/shopping-list`.
     *
     * @param data - The shopping list data to update.
     * @param config - Optional fetch request configuration.
     * @returns A promise that resolves when the shopping list is updated.
     * @throws {Error} Throws an error if the request fails.
     */
    async updateShoppingList(
        userId: number,
        data: ShoppingListPayload,
        config?: RequestConfig
    ): Promise<ShoppingListDTO[]> {
        return await apiRequestWrapper.put({
            url: `/users/${userId}/shopping-list`,
            data,
            ...config
        });
    }

    /**
     * Deletes a shopping list by calling `DELETE /api/users/{id}/shopping-list`.
     *
     * @param data - The shopping list data to delete.
     * @param config - Optional fetch request configuration.
     * @returns A promise that resolves when the shopping list is deleted.
     * @throws {Error} Throws an error if the request fails.
     */
    async deleteShoppingList(
        userId: number,
        data: DeleteShoppingListPayload,
        config?: RequestConfig
    ): Promise<void> {
        await apiRequestWrapper.delete({
            url: `/users/${userId}/shopping-list`,
            data,
            ...config
        });
    }

    /**
     * Verifies a user's email address by calling `PUT /api/users/verify-email`.
     *
     * @param token - The verification token from the email.
     * @param config - Optional fetch request configuration.
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
    async verifyEmail(token: string, config?: RequestConfig): Promise<void> {
        await apiRequestWrapper.put({
            url: '/user/verify-email',
            params: { token },
            ...config
        });
    }

    /**
     * Resends a verification email by calling `POST /api/users/verify-email`.
     *
     * @param email - The email address to resend the verification link to.
     * @param config - Optional fetch request configuration.
     * @returns A promise that resolves when the email is sent.
     * @throws {Error} Throws an error if the request fails.
     */
    async resendVerificationEmail(
        email: string,
        config?: RequestConfig
    ): Promise<void> {
        await apiRequestWrapper.post({
            url: '/user/verify-email',
            data: { email },
            ...config
        });
    }

    /**
     * Sends a password reset email to the user by calling `POST /api/users/reset-password`.
     *
     * @param data - The email address to send the password reset email to.
     * @param config - The fetch request configuration.
     *
     * @returns {Promise<void>} A promise that resolves when the email is sent.
     * @throws {Error} Throws an error if the request fails.
     */
    async sendResetPasswordEmail(
        data: ResetPasswordEmailPayload,
        config?: RequestConfig
    ): Promise<void> {
        await apiRequestWrapper.post({
            url: '/users/reset-password',
            data,
            ...config
        });
    }

    /**
     * Resets a user's password by calling `PUT /api/users/reset-password`.
     *
     * @param data - The new password and the password reset token.
     * @param config - The fetch request configuration.
     *
     * @returns {Promise<void>} A promise that resolves when the password is reset.
     * @throws {Error} Throws an error if the request fails.
     */
    async resetPassword(
        data: ResetPasswordPayload,
        config?: RequestConfig
    ): Promise<void> {
        await apiRequestWrapper.put({
            url: '/users/reset-password',
            data,
            ...config
        });
    }
}

export const userApiClient = new UserApiClient();
