import type { Status, UserDTO, UserRole } from '@/common/types/user';
import type {
    UserForLogin,
    AuthResponse,
    AuthCodePayload
} from '@/common/types';
import bcrypt from 'bcrypt';
import { ServerError } from '@/server/error';
import { createToken, verifyToken } from '@/server/utils/jwt';
import { cookies } from 'next/headers';
import {
    ENV_CONFIG_PRIVATE,
    ENV_CONFIG_PUBLIC,
    JWT_COOKIE_NAME
} from '@/common/constants';
import { userService } from '@/server/services/user/service';
import db from '@/server/db/model';

/**
 * Service class for handling authentication-related logic.
 * This includes user login, logout, session management, and OAuth.
 */
class AuthService {
    //~-----------------------------------------------------------------------------------------~//
    //$                                          LOGIN                                          $//
    //~-----------------------------------------------------------------------------------------~//

    //|-----------------------------------------------------------------------------------------|//
    //?                                         MANUAL                                          ?//
    //|-----------------------------------------------------------------------------------------|//

    /**
     * Authenticates a user with their email and password.
     * It validates credentials, and on success, updates the last login time
     * and returns a JWT and user data.
     *
     * @param payload - The user's login credentials.
     * @returns A promise that resolves to an object containing the JWT and user data.
     * @throws {ServerError} Throws an error with status 400 if email or password are not provided.
     * @throws {ServerError} Throws an error with status 401 for invalid credentials.
     * @throws {ServerError} Throws an error with status 403 if the user's email is not verified.
     */
    async login(payload: UserForLogin): Promise<AuthResponse> {
        const { email, password } = payload;

        if (!email) {
            throw new ServerError('auth.error.email-required', 400);
        }

        if (!password) {
            throw new ServerError('auth.error.password-required', 400);
        }

        const user = await db.user.getOneByEmail(email);

        if (!user || !user.passwordHash) {
            throw new ServerError('auth.error.invalid-credentials', 401);
        }

        if (!user.emailVerified) {
            throw new ServerError('auth.error.email-not-verified', 403);
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.passwordHash
        );

        if (!isPasswordValid) {
            throw new ServerError('auth.error.invalid-credentials', 401);
        }

        await db.user.updateOneById(user.id, { lastLogin: new Date() });

        const token = createToken({
            id: user.id.toString(),
            role: user.role as UserRole
        });

        const userResponse: UserDTO = {
            id: user.id,
            email: user.email,
            username: user.username,
            avatarUrl: user.avatarUrl,
            createdAt: user.createdAt.toISOString(),
            role: user.role as UserRole,
            status: user.status as Status,
            lastLogin: user.lastLogin?.toISOString() || null
        };

        return { token, user: userResponse };
    }

    //|-----------------------------------------------------------------------------------------|//
    //?                                         GOOGLE                                          ?//
    //|-----------------------------------------------------------------------------------------|//

    /**
     * Authenticates a user using a Google OAuth authorization code.
     * It exchanges the code for an access token, fetches user info from Google,
     * and then either finds an existing user or creates a new one.
     *
     * @param payload - The payload containing the Google OAuth authorization code.
     * @returns A promise that resolves to an object containing the JWT and user data.
     * @throws {ServerError} Throws an error with status 400 if the Google OAuth code is missing.
     * @throws {ServerError} Throws an error with status 401 if the access token is missing.
     * @throws {ServerError} Throws an error with status 401 if the user info is missing.
     */
    async loginWithGoogleOauth(
        payload: AuthCodePayload
    ): Promise<AuthResponse> {
        const { code } = payload;

        if (!code) {
            throw new ServerError('auth.error.google-oauth-code-required', 400);
        }

        const accessTokenParams = new URLSearchParams({
            code,
            client_id: ENV_CONFIG_PUBLIC.GOOGLE_OAUTH_CLIENT_ID,
            client_secret: ENV_CONFIG_PRIVATE.GOOGLE_OAUTH_CLIENT_SECRET,
            grant_type: 'authorization_code',
            redirect_uri: ENV_CONFIG_PRIVATE.GOOGLE_OAUTH_REDIRECT_URI,
            access_type: 'offline',
            approval_prompt: 'force'
        });

        const accessTokenResponse = await fetch(
            `https://oauth2.googleapis.com/token`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: accessTokenParams.toString()
            }
        );

        if (!accessTokenResponse.ok) {
            throw new ServerError('auth.error.failed-to-get-access-token', 401);
        }

        const accessTokenData = await accessTokenResponse.json();
        const accessToken = accessTokenData.access_token;

        const userInfoResponse = await fetch(
            `https://www.googleapis.com/oauth2/v3/userinfo`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );

        if (!userInfoResponse.ok) {
            throw new ServerError('auth.error.failed-to-get-user-info', 401);
        }

        const userInfoData: UserFromGoogle = await userInfoResponse.json();
        const dbUser = await db.user.getOneByEmail(userInfoData.email);

        let user: UserDTO;

        if (dbUser) {
            user = {
                id: dbUser.id,
                email: dbUser.email,
                username: dbUser.username,
                avatarUrl: dbUser.avatarUrl,
                createdAt: dbUser.createdAt.toISOString(),
                role: dbUser.role as UserRole,
                status: dbUser.status as Status,
                lastLogin: dbUser.lastLogin?.toISOString() ?? null
            };
        } else {
            user = await userService.createUserFromGoogle({
                email: userInfoData.email,
                username: userInfoData.name,
                avatarUrl: userInfoData.picture
            });
        }

        const token = createToken({
            id: user.id.toString(),
            role: user.role
        });

        return { token, user };
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                         LOGOUT                                          $//
    //~-----------------------------------------------------------------------------------------~//

    /**
     * Logs out the currently authenticated user by deleting the JWT cookie.
     *
     * @returns void.
     * @throws {ServerError} Throws an error with status 500 if there is an error.
     */
    async logout(): Promise<void> {
        const cookieStore = await cookies();
        cookieStore.delete('jwt');
        return;
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                       GET CURRENT                                       $//
    //~-----------------------------------------------------------------------------------------~//

    /**
     * Retrieves the currently authenticated user based on the JWT cookie.
     *
     * @returns A promise that resolves to the authenticated user's data.
     * @throws {ServerError} Throws an error with status 401 if the user is not authenticated.
     * @throws {ServerError} Throws an error with status 404 if the user is not found.
     */
    async getCurrentUser(): Promise<UserDTO> {
        const cookieStore = await cookies();
        const token = cookieStore?.get(JWT_COOKIE_NAME)?.value;

        if (!token) {
            throw new ServerError('auth.error.unauthorized', 401);
        }

        const decoded = verifyToken(token);
        const user = await db.user.getOneById(Number(decoded.id));

        if (!user) {
            throw new ServerError('auth.error.user-not-found', 404);
        }

        if (!user.emailVerified) {
            throw new ServerError('auth.error.email-not-verified', 403);
        }

        return {
            id: user.id,
            email: user.email,
            username: user.username,
            avatarUrl: user.avatarUrl,
            createdAt: user.createdAt.toISOString(),
            role: user.role as UserRole,
            status: user.status as Status,
            lastLogin: user.lastLogin?.toISOString() || null
        };
    }
}

export const authService = new AuthService();

type UserFromGoogle = {
    email: string;
    email_verified: boolean;
    family_name: string;
    given_name: string;
    name: string;
    picture: string;
    sub: string;
};
