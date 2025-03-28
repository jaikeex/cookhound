import { apiService } from '@/client/services/ApiService';
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
class AuthService {
    /**
     * Gets the currently logged-in user.
     *
     * @param next - The Next.js fetch request configuration.
     *
     * @returns {Promise<User>} The currently logged-in user.
     * @throws {Error} Throws an error if the request fails.
     */
    async getCurrentUser(next?: NextFetchRequestConfig): Promise<User> {
        return await apiService.get({ url: '/auth/current', next });
    }

    /**
     * Logs in a user.
     *
     * @param data - The user's email and password.
     * @param next - The Next.js fetch request configuration.
     *
     * @returns {Promise<User>} The user that was logged in.
     * @throws {Error} Throws an error if the request fails.
     */
    async login(
        data: UserForLogin,
        next?: NextFetchRequestConfig
    ): Promise<User> {
        return await apiService.post<User>({
            url: '/auth/login',
            data,
            next
        });
    }

    /**
     * Logs in a user using Google OAuth.
     *
     * @param data - The Google OAuth code.
     * @param next - The Next.js fetch request configuration.
     *
     * @returns {Promise<User>} The user that was logged in.
     * @throws {Error} Throws an error if the request fails.
     */
    async loginWithGoogleOauth(
        data: AuthCodePayload,
        next?: NextFetchRequestConfig
    ): Promise<User> {
        return await apiService.post<User>({
            url: '/auth/google',
            data,
            next
        });
    }

    /**
     * Logs out the currently logged-in user.
     *
     * @param next - The Next.js fetch request configuration.
     *
     * @returns {Promise<void>} A promise that resolves when the user is logged out.
     * @throws {Error} Throws an error if the request fails.
     */
    async logout(next?: NextFetchRequestConfig): Promise<void> {
        await apiService.post({
            url: '/auth/logout',
            next
        });
    }

    /**
     * Sends a password reset email to the user.
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
        await apiService.post({
            url: '/auth/password-reset',
            data,
            next
        });
    }

    /**
     * Resets a user's password.
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
        await apiService.put({
            url: '/auth/password-reset',
            data,
            next
        });
    }
}

export const authService = new AuthService();
