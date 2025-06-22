import { AuthType, Status, UserRole } from '@/common/types';
import {
    type UserDTO,
    type UserForCreatePayload,
    type UserForGoogleCreatePayload
} from '@/common/types';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { mailService } from '@/server/services';
import { ServerError } from '@/server/error';
import { type UserForGoogleCreate, type UserForLocalCreate } from './types';
import { createUserDTO } from './utils';
import db from '@/server/db/model';
import { Logger } from '@/server/logger';

//|=============================================================================================|//

const log = Logger.getInstance('user-service');

/**
 * Service class for user-related business logic.
 * It handles user creation, email verification, and other user-centric operations.
 */
class UserService {
    //~-----------------------------------------------------------------------------------------~//
    //$                                         CREATE                                          $//
    //~-----------------------------------------------------------------------------------------~//

    //|-----------------------------------------------------------------------------------------|//
    //?                                         MANUAL                                          ?//
    //|-----------------------------------------------------------------------------------------|//

    /**
     * Creates a new user with local authentication (email and password).
     * It hashes the password, generates a verification token, and sends a verification email.
     *
     * @param payload - The data for creating a new user, including email, password, and username.
     * @returns A promise that resolves to the newly created user object.
     * @throws {ServerError} Throws an error with status 400 if required fields are missing.
     * @throws {ServerError} Throws an error with status 409 if email or username is already taken.
     */
    async createUser(payload: UserForCreatePayload): Promise<UserDTO> {
        const { email, password, username } = payload;

        log.trace('createUser - attempt', { email, password, username });

        if (!email || !password || !username) {
            log.warn('createUser - missing required fields', {
                email,
                password,
                username
            });

            throw new ServerError(
                'auth.error.email-password-username-required',
                400
            );
        }

        const existingUser = await db.user.getOneByEmailOrUsername(
            email,
            username
        );

        const availability = {
            email: existingUser?.email !== email,
            username: existingUser?.username !== username
        };

        if (!availability.email) {
            log.info('createUser - email already taken', { email });
            throw new ServerError('auth.error.email-already-taken', 409);
        }

        if (!availability.username) {
            log.info('createUser - username already taken', { username });
            throw new ServerError('auth.error.username-already-taken', 409);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const verificationToken = uuid();

        const userForCreate: UserForLocalCreate = {
            email,
            passwordHash: hashedPassword,
            username,
            authType: AuthType.Local,
            role: UserRole.User,
            status: Status.Active,
            emailVerified: false,
            emailVerificationToken: verificationToken
        };

        const user = await db.user.createOne(userForCreate);

        log.notice('createUser - success', { email, username });

        await mailService.sendEmailVerification(
            user.email,
            user.username,
            verificationToken
        );

        const userResponse: UserDTO = createUserDTO(user);

        return userResponse;
    }

    //|-----------------------------------------------------------------------------------------|//
    //?                                         GOOGLE                                          ?//
    //|-----------------------------------------------------------------------------------------|//

    /**
     * Creates a new user from a Google OAuth sign-in.
     *
     * @param payload - The data from Google, including email, username, and avatar URL.
     * @returns A promise that resolves to the newly created user object.
     * @throws {ServerError} Throws an error if a user with the same email already exists.
     */
    async createUserFromGoogle(
        payload: UserForGoogleCreatePayload
    ): Promise<UserDTO> {
        const { email, username, avatarUrl } = payload;

        log.trace('createUserFromGoogle - attempt', { email, username });

        const existingUser = await db.user.getOneByEmail(email);

        if (existingUser) {
            log.info('createUserFromGoogle - user already exists', { email });

            throw new ServerError('auth.error.user-already-exists', 400);
        }

        const userForCreate: UserForGoogleCreate = {
            email,
            username,
            avatarUrl,
            authType: AuthType.Google,
            role: UserRole.User,
            status: Status.Active,
            emailVerified: true
        };

        const user = await db.user.createOne(userForCreate);

        log.notice('createUserFromGoogle - success', { email, username });

        const userResponse: UserDTO = createUserDTO(user);

        return userResponse;
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                       VERIFY EMAIL                                      $//
    //~-----------------------------------------------------------------------------------------~//

    /**
     * Verifies a user's email address using a verification token.
     *
     * @param token - The email verification token.
     * @throws {ServerError} Throws an error with status 400 if the token is missing.
     * @throws {ServerError} Throws an error with status 404 if the user is not found.
     * @throws {ServerError} Throws an error with status 403 if the email is already verified.
     */
    async verifyEmail(token: string): Promise<void> {
        log.trace('verifyEmail - attempt', { token });

        if (!token) {
            log.warn('verifyEmail - missing token', { token });

            throw new ServerError('auth.error.missing-token', 400);
        }

        const user = await db.user.getOneByEmailVerificationToken(token);

        if (!user) {
            log.warn('verifyEmail - user not found', { token });

            throw new ServerError('auth.error.user-not-found', 404);
        }

        if (user.emailVerified) {
            log.info('verifyEmail - email already verified', { token });

            throw new ServerError('auth.error.email-already-verified', 403);
        }

        await db.user.updateOneById(user.id, {
            emailVerified: true,
            emailVerificationToken: null
        });

        log.notice('verifyEmail - success', { token });

        return;
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                 SEND VERIFICATION EMAIL                                 $//
    //~-----------------------------------------------------------------------------------------~//

    /**
     * Resends an email verification link to a user.
     * It generates a new token and sends it to the user's email.
     *
     * @param email - The email address of the user.
     * @throws {ServerError} Throws an error if the email is missing, user not found, or email is already verified.
     */
    async resendVerificationEmail(email: string): Promise<void> {
        log.trace('resendVerificationEmail - attempt', { email });

        if (!email) {
            throw new ServerError('auth.error.email-required', 400);
        }

        const user = await db.user.getOneByEmail(email);

        if (!user) {
            log.warn('resendVerificationEmail - user not found', { email });

            throw new ServerError('auth.error.user-not-found', 404);
        }

        if (user.emailVerified) {
            log.info('resendVerificationEmail - email already verified', {
                email
            });

            throw new ServerError('auth.error.email-already-verified', 400);
        }

        const verificationToken = uuid();

        await db.user.updateOneById(user.id, {
            emailVerificationToken: verificationToken
        });

        await mailService.sendEmailVerification(
            user.email,
            user.username,
            verificationToken
        );

        log.trace('resendVerificationEmail - success', { email });

        return;
    }
}

export const userService = new UserService();
