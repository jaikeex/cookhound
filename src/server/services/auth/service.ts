import type { Status, UserDTO, UserRole } from '@/common/types/user';
import type {
    UserForLogin,
    AuthResponse,
    AuthCodePayload
} from '@/common/types';
import bcrypt from 'bcrypt';
import {
    AuthErrorForbidden,
    AuthErrorUnauthorized,
    ValidationError
} from '@/server/error';
import { createToken } from '@/server/utils/session/jwt';
import { ENV_CONFIG_PRIVATE, ENV_CONFIG_PUBLIC } from '@/common/constants';
import { userService } from '@/server/services/user/service';
import db from '@/server/db/model';
import { Logger } from '@/server/logger';
import { deleteSession } from '@/server/utils/session';
import { RequestContext } from '@/server/utils/reqwest/context';
import { ApplicationErrorCode } from '@/server/error/codes';

//|=============================================================================================|//

const log = Logger.getInstance('auth-service');

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

        log.trace('login attempt', { email });

        if (!email) {
            log.info('login - email required', { email });
            throw new ValidationError(
                'auth.error.email-required',
                ApplicationErrorCode.MISSING_FIELD
            );
        }

        if (!password) {
            log.info('login - password required', { password });
            throw new ValidationError(
                'auth.error.password-required',
                ApplicationErrorCode.MISSING_FIELD
            );
        }

        const user = await db.user.getOneByEmail(email);

        if (!user || !user.passwordHash) {
            log.info('login - user not found', { email });
            throw new AuthErrorUnauthorized(
                'auth.error.invalid-credentials',
                ApplicationErrorCode.INVALID_CREDENTIALS
            );
        }

        if (!user.emailVerified) {
            log.info('login - email not verified', { email });
            throw new AuthErrorForbidden(
                'auth.error.email-not-verified',
                ApplicationErrorCode.EMAIL_NOT_VERIFIED
            );
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.passwordHash
        );

        if (!isPasswordValid) {
            log.info('login - invalid password', { email });
            throw new AuthErrorUnauthorized(
                'auth.error.invalid-credentials',
                ApplicationErrorCode.INVALID_CREDENTIALS
            );
        }

        await db.user.updateOneById(user.id, { lastLogin: new Date() });

        const token = createToken({
            id: user.id.toString(),
            role: user.role as UserRole
        });

        log.trace('login - success', { email });

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
    async loginWithGoogle(payload: AuthCodePayload): Promise<AuthResponse> {
        const { code } = payload;

        log.trace('loginWithGoogle attempt');

        if (!code) {
            log.warn('loginWithGoogle - code required');
            throw new ValidationError(
                'auth.error.google-oauth-code-required',
                ApplicationErrorCode.MISSING_FIELD
            );
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
            log.warn('loginWithGoogle - failed to get access token');
            throw new AuthErrorUnauthorized(
                'auth.error.failed-to-get-access-token',
                ApplicationErrorCode.GOOGLE_OAUTH_FAILED
            );
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
            log.warn('loginWithGoogle - failed to get user info');
            throw new AuthErrorUnauthorized(
                'auth.error.failed-to-get-user-info',
                ApplicationErrorCode.GOOGLE_OAUTH_FAILED
            );
        }

        const userInfoData: UserFromGoogle = await userInfoResponse.json();
        const dbUser = await db.user.getOneByEmail(userInfoData.email);

        let user: UserDTO;

        if (dbUser) {
            log.trace('loginWithGoogle - user found', {
                email: userInfoData.email
            });

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
            log.info('loginWithGoogle - creating new user', {
                email: userInfoData.email
            });

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

        log.trace('loginWithGoogle - success', {
            email: userInfoData.email
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
        log.trace('logout attempt');
        deleteSession();
        log.trace('logout - success');

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
        const userId = RequestContext.getUserId();

        if (!userId) {
            log.trace('getCurrentUser - no token found');
            throw new AuthErrorUnauthorized();
        }

        const user = await db.user.getOneById(Number(userId));

        if (!user) {
            log.warn('getCurrentUser - user not found', {
                id: userId
            });

            deleteSession();
            throw new AuthErrorUnauthorized(
                'auth.error.user-not-found',
                ApplicationErrorCode.USER_NOT_FOUND
            );
        }

        if (!user.emailVerified) {
            log.trace('getCurrentUser - email not verified', {
                id: userId
            });

            deleteSession();
            throw new AuthErrorUnauthorized(
                'auth.error.email-not-verified',
                ApplicationErrorCode.EMAIL_NOT_VERIFIED
            );
        }

        log.trace('getCurrentUser - success', {
            id: userId
        });

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
