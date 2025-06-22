import type { RequestConfig } from '@/client/request/ApiRequestWrapper';
import { apiRequestWrapper } from '@/client/request/ApiRequestWrapper';
import type { UserDTO, AuthCodePayload, UserForLogin } from '@/common/types';

/**
 * Service for user-related operations.
 */
class AuthApiClient {
    /**
     * Gets the currently logged-in user by calling `GET /auth/current`.
     *
     * @param config - The fetch request configuration.
     *
     * @returns {Promise<UserDTO>} The currently logged-in user.
     * - 200: Success, with user object.
     *
     * @throws {Error} Throws an error if the request fails.
     * - 401: Unauthorized, if JWT is missing or invalid.
     * - 404: Not Found, if user from JWT does not exist.
     * - 500: Internal Server Error, if there is another error during authentication.
     */
    async getCurrentUser(config?: RequestConfig): Promise<UserDTO> {
        return await apiRequestWrapper.get({ url: '/auth/current', ...config });
    }

    /**
     * Logs in a user by calling `POST /auth/login`.
     *
     * @param data - The user's email and password.
     * @param config - The fetch request configuration.
     *
     * @returns {Promise<UserDTO>} The user that was logged in.
     * - 200: Success, with user object.
     *
     * @throws {Error} Throws an error if the request fails.
     * - 400: Bad Request, if the email, password, or keepLoggedIn flag is missing.
     * - 401: Unauthorized, if the email or password is invalid.
     * - 403: Forbidden, if the user's email is not verified.
     * - 500: Internal Server Error, if there is another error during authentication.
     */
    async login(data: UserForLogin, config?: RequestConfig): Promise<UserDTO> {
        return await apiRequestWrapper.post<UserDTO>({
            url: '/auth/login',
            data,
            ...config
        });
    }

    /**
     * Logs in a user using Google OAuth by calling `POST /auth/google`.
     *
     * @param data - The Google OAuth code.
     * @param config - The fetch request configuration.
     *
     * @returns {Promise<UserDTO>} The user that was logged in.
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
        config?: RequestConfig
    ): Promise<UserDTO> {
        return await apiRequestWrapper.post<UserDTO>({
            url: '/auth/google',
            data,
            ...config
        });
    }

    /**
     * Logs out the currently logged-in user by calling `POST /auth/logout`.
     *
     * @param config - The fetch request configuration.
     *
     * @returns {Promise<void>} A promise that resolves when the user is logged out.
     * - 200: Success, with a success message.
     *
     * @throws {Error} Throws an error if the request fails.
     * - 500: Internal Server Error, if there is another error during logout.
     */
    async logout(config?: RequestConfig): Promise<void> {
        await apiRequestWrapper.post({
            url: '/auth/logout',
            ...config
        });
    }
}

export const authApiClient = new AuthApiClient();
