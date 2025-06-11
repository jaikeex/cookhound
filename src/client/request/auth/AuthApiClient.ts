import { apiRequestWrapper } from '@/client/request/ApiRequestWrapper';
import type {
    User,
    AuthCodePayload,
    ResetPasswordEmailPayload,
    ResetPasswordPayload,
    UserForLogin
} from '@/common/types';

/**
 * Service for user-related operations.
 */
class AuthApiClient {
    /**
     * Gets the currently logged-in user by calling `GET /auth/current`.
     *
     * @param next - The Next.js fetch request configuration.
     *
     * @returns {Promise<User>} The currently logged-in user.
     * - 200: Success, with user object.
     *
     * @throws {Error} Throws an error if the request fails.
     * - 401: Unauthorized, if JWT is missing or invalid.
     * - 404: Not Found, if user from JWT does not exist.
     * - 500: Internal Server Error, if there is another error during authentication.
     */
    async getCurrentUser(next?: NextFetchRequestConfig): Promise<User> {
        return await apiRequestWrapper.get({ url: '/auth/current', next });
    }

    /**
     * Logs in a user by calling `POST /auth/login`.
     *
     * @param data - The user's email and password.
     * @param next - The Next.js fetch request configuration.
     *
     * @returns {Promise<User>} The user that was logged in.
     * - 200: Success, with user object.
     *
     * @throws {Error} Throws an error if the request fails.
     * - 400: Bad Request, if the email, password, or keepLoggedIn flag is missing.
     * - 401: Unauthorized, if the email or password is invalid.
     * - 403: Forbidden, if the user's email is not verified.
     * - 500: Internal Server Error, if there is another error during authentication.
     */
    async login(
        data: UserForLogin,
        next?: NextFetchRequestConfig
    ): Promise<User> {
        return await apiRequestWrapper.post<User>({
            url: '/auth/login',
            data,
            next
        });
    }

    /**
     * Logs in a user using Google OAuth by calling `POST /auth/google`.
     *
     * @param data - The Google OAuth code.
     * @param next - The Next.js fetch request configuration.
     *
     * @returns {Promise<User>} The user that was logged in.
     * - 200: Success, with user object.
     *
     * @throws {Error} Throws an error if the request fails.
     * - 400: Bad Request, if the Google OAuth code is missing.
     * - 401: Unauthorized, if the Google OAuth code is invalid or the access
     *        token is missing or the user info is missing.
     * - 500: Internal Server Error, if there is another error during authentication.
     *
     */
    async loginWithGoogleOauth(
        data: AuthCodePayload,
        next?: NextFetchRequestConfig
    ): Promise<User> {
        return await apiRequestWrapper.post<User>({
            url: '/auth/google',
            data,
            next
        });
    }

    /**
     * Logs out the currently logged-in user by calling `POST /auth/logout`.
     *
     * @param next - The Next.js fetch request configuration.
     *
     * @returns {Promise<void>} A promise that resolves when the user is logged out.
     * - 200: Success, with a success message.
     *
     * @throws {Error} Throws an error if the request fails.
     * - 500: Internal Server Error, if there is another error during logout.
     */
    async logout(next?: NextFetchRequestConfig): Promise<void> {
        await apiRequestWrapper.post({
            url: '/auth/logout',
            next
        });
    }

    /**
     * Sends a password reset email to the user by calling `POST /auth/password-reset`.
     *
     * @param data - The email address to send the password reset email to.
     * @param next - The Next.js fetch request configuration.
     *
     * @returns {Promise<void>} A promise that resolves when the email is sent.
     * @throws {Error} Throws an error if the request fails.
     */
    async sendResetPasswordEmail(
        data: ResetPasswordEmailPayload,
        next?: NextFetchRequestConfig
    ): Promise<void> {
        await apiRequestWrapper.post({
            url: '/auth/password-reset',
            data,
            next
        });
    }

    /**
     * Resets a user's password by calling `PUT /auth/password-reset`.
     *
     * @param data - The new password and the password reset token.
     * @param next - The Next.js fetch request configuration.
     *
     * @returns {Promise<void>} A promise that resolves when the password is reset.
     * @throws {Error} Throws an error if the request fails.
     */
    async resetPassword(
        data: ResetPasswordPayload,
        next?: NextFetchRequestConfig
    ): Promise<void> {
        await apiRequestWrapper.put({
            url: '/auth/password-reset',
            data,
            next
        });
    }
}

export const authApiClient = new AuthApiClient();
