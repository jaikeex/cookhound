import { AuthType, Status, UserRole } from '@/common/types';
import {
    type UserDTO,
    type UserForCreatePayload,
    type UserForGoogleCreatePayload
} from '@/common/types';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { mailService } from '@/server/services';
import { HttpError } from '@/common/errors/HttpError';
import { type UserForGoogleCreate, type UserForLocalCreate } from './types';
import { createUserDTO } from './utils';
import db from '@/server/db/model';

/**
 * Service class for user-related business logic.
 * It handles user creation, email verification, and other user-centric operations.
 */
class UserService {
    /**
     * Creates a new user with local authentication (email and password).
     * It hashes the password, generates a verification token, and sends a verification email.
     *
     * @param payload - The data for creating a new user, including email, password, and username.
     * @returns A promise that resolves to the newly created user object.
     * @throws {HttpError} Throws an error with status 400 if required fields are missing.
     * @throws {HttpError} Throws an error with status 409 if email or username is already taken.
     */
    async createUser(payload: UserForCreatePayload): Promise<UserDTO> {
        const { email, password, username } = payload;

        if (!email || !password || !username) {
            throw new HttpError(
                'Email, password, and username are required',
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
            throw new HttpError('Email is already taken', 409);
        }

        if (!availability.username) {
            throw new HttpError('Username is already taken', 409);
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

        await mailService.sendEmailVerification(
            user.email,
            user.username,
            verificationToken
        );

        const userResponse: UserDTO = createUserDTO(user);

        return userResponse;
    }

    /**
     * Creates a new user from a Google OAuth sign-in.
     *
     * @param payload - The data from Google, including email, username, and avatar URL.
     * @returns A promise that resolves to the newly created user object.
     * @throws {HttpError} Throws an error if a user with the same email already exists.
     */
    async createUserFromGoogle(
        payload: UserForGoogleCreatePayload
    ): Promise<UserDTO> {
        const { email, username, avatarUrl } = payload;

        const existingUser = await db.user.getOneByEmail(email);

        if (existingUser) {
            throw new HttpError('User already exists', 400);
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

        const userResponse: UserDTO = createUserDTO(user);

        return userResponse;
    }

    /**
     * Verifies a user's email address using a verification token.
     *
     * @param token - The email verification token.
     * @throws {HttpError} Throws an error with status 400 if the token is missing.
     * @throws {HttpError} Throws an error with status 404 if the user is not found.
     * @throws {HttpError} Throws an error with status 403 if the email is already verified.
     */
    async verifyEmail(token: string): Promise<void> {
        if (!token) {
            throw new HttpError('Token is required', 400);
        }

        const user = await db.user.getOneByEmailVerificationToken(token);

        if (!user) {
            throw new HttpError('User not found', 404);
        }

        if (user.emailVerified) {
            throw new HttpError('Email already verified', 403);
        }

        await db.user.updateOneById(user.id, {
            emailVerified: true,
            emailVerificationToken: null
        });
    }

    /**
     * Resends an email verification link to a user.
     * It generates a new token and sends it to the user's email.
     *
     * @param email - The email address of the user.
     * @throws {HttpError} Throws an error if the email is missing, user not found, or email is already verified.
     */
    async resendVerificationEmail(email: string): Promise<void> {
        if (!email) {
            throw new HttpError('Email is required', 400);
        }

        const user = await db.user.getOneByEmail(email);

        if (!user) {
            throw new HttpError('User not found', 404);
        }

        if (user.emailVerified) {
            throw new HttpError('Email already verified', 400);
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
    }
}

export const userService = new UserService();
