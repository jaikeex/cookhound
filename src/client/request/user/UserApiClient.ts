import type { RequestConfig } from '@/client/request/ApiRequestWrapper';
import { apiRequestWrapper } from '@/client/request/ApiRequestWrapper';
import type {
    ResetPasswordEmailPayload,
    ResetPasswordPayload,
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
     * Verifies a user's email address by calling `PUT /api/user/verify-email`.
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
     * Resends a verification email by calling `POST /api/user/verify-email`.
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
     * Sends a password reset email to the user by calling `POST /user/password-reset`.
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
            url: '/user/password-reset',
            data,
            ...config
        });
    }

    /**
     * Resets a user's password by calling `PUT /user/password-reset`.
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
            url: '/user/password-reset',
            data,
            ...config
        });
    }
}

export const userApiClient = new UserApiClient();
