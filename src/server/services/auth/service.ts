import type {
    UserDTO,
    UserRole,
    UserVisibilityGroup,
    Status
} from '@/common/types';
import type {
    UserForLogin,
    AuthResponse,
    AuthCodePayload
} from '@/common/types';
import {
    AuthErrorForbidden,
    AuthErrorUnauthorized,
    ValidationError
} from '@/server/error';
import { ENV_CONFIG_PRIVATE, ENV_CONFIG_PUBLIC } from '@/common/constants';
import { userService } from '@/server/services/user/service';
import db, { getUserSelect } from '@/server/db/model';
import { Logger, LogServiceMethod } from '@/server/logger';
import { deleteSessionCookie, sessions } from '@/server/utils/session';
import { RequestContext } from '@/server/utils/reqwest/context';
import { ApplicationErrorCode } from '@/server/error/codes';
import { createUserDTO } from '@/server/services/user/utils';
import { assertAuthenticated } from '@/server/utils/reqwest';
import {
    safeVerifyPassword,
    needsRehash,
    hashPassword
} from '@/server/utils/crypto';

//|=============================================================================================|//

const log = Logger.getInstance('auth-service');

// This is true by definition for all methods in this service
const AUTH_USER_GROUPS = ['self'] as UserVisibilityGroup[];
const AUTH_USER_SELECT = getUserSelect(AUTH_USER_GROUPS);

/**
 * Handles authentication flows including local login, Google OAuth,
 * session lifecycle, and current-user resolution.
 */
class AuthService {
    //~-----------------------------------------------------------------------------------------~//
    //$                                          LOGIN                                          $//
    //~-----------------------------------------------------------------------------------------~//

    //|-----------------------------------------------------------------------------------------|//
    //?                                         MANUAL                                          ?//
    //|-----------------------------------------------------------------------------------------|//

    /**
     * Authenticates a user with email and password. On success, creates a
     * new session and updates the last login timestamp. Transparently
     * rehashes the password if the stored hash uses an outdated algorithm.
     *
     * @param payload - Login credentials (email and password).
     * @returns Session token and the authenticated user DTO.
     * @throws {AuthErrorUnauthorized} If the credentials are invalid.
     * @throws {AuthErrorForbidden} If the account is banned or the email is not verified.
     */
    @LogServiceMethod({ excludeArgs: true })
    async login(payload: UserForLogin): Promise<AuthResponse> {
        const { email, password } = payload;

        const user = await db.user.getOneByEmail(email, AUTH_USER_SELECT);

        const isPasswordValid = await safeVerifyPassword(
            password,
            user?.passwordHash
        );

        if (!user || !user.passwordHash || !isPasswordValid) {
            log.info('login - user not found', { email });
            throw new AuthErrorUnauthorized(
                'auth.error.invalid-credentials',
                ApplicationErrorCode.INVALID_CREDENTIALS
            );
        }

        if (user.status === 'banned') {
            log.info('login - account banned', { email });

            throw new AuthErrorForbidden(
                'auth.error.account-banned',
                ApplicationErrorCode.ACCOUNT_BANNED
            );
        }

        if (!user.emailVerified) {
            log.info('login - email not verified', { email });
            throw new AuthErrorForbidden(
                'auth.error.email-not-verified',
                ApplicationErrorCode.EMAIL_NOT_VERIFIED
            );
        }

        if (needsRehash(user.passwordHash)) {
            log.info('login - rehashing password', {
                userId: user.id
            });

            const newHash = await hashPassword(password);
            await db.user.updateOneById(user.id, {
                passwordHash: newHash
            });
        }

        await db.user.updateOneById(user.id, { lastLogin: new Date() });

        deleteSessionCookie();

        const token = await sessions.createSession(user.id, {
            ipAddress: RequestContext.getIp(),
            userAgent: RequestContext.getUserAgent(),
            userRole: user.role as UserRole,
            status: user.status as Status,
            loginMethod: 'manual'
        });

        const userResponse: UserDTO = createUserDTO(user);

        return { token, user: userResponse };
    }

    //|-----------------------------------------------------------------------------------------|//
    //?                                         GOOGLE                                          ?//
    //|-----------------------------------------------------------------------------------------|//

    /**
     * Authenticates a user via Google OAuth. Exchanges the authorization code
     * for an access token, fetches the user's Google profile, and either
     * logs in the existing user or creates a new account.
     *
     * @param payload - The Google OAuth authorization code.
     * @returns Session token and the authenticated (or newly created) user DTO.
     * @throws {ValidationError} If the authorization code is missing.
     * @throws {AuthErrorUnauthorized} If the token exchange or profile fetch fails.
     * @throws {AuthErrorForbidden} If the account is banned.
     */
    @LogServiceMethod({ names: ['payload'] })
    async loginWithGoogle(payload: AuthCodePayload): Promise<AuthResponse> {
        const { code } = payload;

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
        const dbUser = await db.user.getOneByEmail(
            userInfoData.email,
            AUTH_USER_SELECT
        );

        let user: UserDTO;

        if (dbUser) {
            if (dbUser.status === 'banned') {
                log.info('loginWithGoogle - account banned', {
                    email: userInfoData.email
                });

                throw new AuthErrorForbidden(
                    'auth.error.account-banned',
                    ApplicationErrorCode.ACCOUNT_BANNED
                );
            }

            log.trace('loginWithGoogle - user found', {
                email: userInfoData.email
            });

            user = createUserDTO(dbUser);
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

        const token = await sessions.createSession(user.id, {
            ipAddress: RequestContext.getIp(),
            userAgent: RequestContext.getUserAgent(),
            userRole: user.role as UserRole,
            status: user.status as Status,
            loginMethod: 'google'
        });

        return { token, user };
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                         LOGOUT                                          $//
    //~-----------------------------------------------------------------------------------------~//

    /**
     * Logs out the current session by invalidating it server-side
     * and deleting the session cookie.
     *
     * @param sessionId - ID of the session to invalidate.
     */
    @LogServiceMethod({ names: ['sessionId'] })
    async logout(sessionId: string): Promise<void> {
        await sessions.invalidateSession(sessionId);
        deleteSessionCookie();

        return;
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                    LOGOUT EVERYWHERE                                    $//
    //~-----------------------------------------------------------------------------------------~//

    /**
     * Invalidates all sessions for the authenticated user across all
     * devices and deletes the current session cookie.
     *
     * @throws {AuthErrorUnauthorized} If no authenticated user is found in the request context.
     */
    @LogServiceMethod({ names: ['userId'] })
    async logoutEverywhere(): Promise<void> {
        const userId = RequestContext.getUserId();

        if (!userId) {
            log.trace('logoutEverywhere - no userId in context');
            throw new AuthErrorUnauthorized();
        }

        await sessions.invalidateAllUserSessions(userId);

        deleteSessionCookie();
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                       GET CURRENT                                       $//
    //~-----------------------------------------------------------------------------------------~//

    /**
     * Resolves the currently authenticated user from the request context.
     * If the user no longer exists or their email is unverified, all sessions
     * are invalidated and an unauthorized error is thrown. Registers a user
     * visit on success.
     *
     * @returns The authenticated user DTO with self-visibility fields.
     * @throws {AuthErrorUnauthorized} If not authenticated, user not found, or email unverified.
     */
    @LogServiceMethod({ names: ['userId'] })
    async getCurrentUser(): Promise<UserDTO> {
        const userId = assertAuthenticated();

        // This is true by definition
        const groups = ['self'] as UserVisibilityGroup[];
        const select = getUserSelect(groups);

        const user = await db.user.getOneById(Number(userId), select);

        if (!user) {
            log.warn('getCurrentUser - user not found', {
                id: userId
            });

            sessions.invalidateAllUserSessions(userId);
            deleteSessionCookie();

            throw new AuthErrorUnauthorized(
                'auth.error.user-not-found',
                ApplicationErrorCode.USER_NOT_FOUND
            );
        }

        if (!user.emailVerified) {
            log.trace('getCurrentUser - email not verified', {
                id: userId
            });

            sessions.invalidateAllUserSessions(userId);
            deleteSessionCookie();

            throw new AuthErrorUnauthorized(
                'auth.error.email-not-verified',
                ApplicationErrorCode.EMAIL_NOT_VERIFIED
            );
        }

        db.user.registerUserVisit(user.id);

        const userResponse = createUserDTO(user);

        return userResponse;
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
