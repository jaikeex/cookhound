import { AuthType, Status, UserRole } from '@/common/types';
import type {
    RecipeForDisplayDTO,
    ShoppingListDTO,
    ShoppingListIngredientPayload,
    UserDTO,
    UserForCreatePayload,
    UserForGoogleCreatePayload
} from '@/common/types';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { mailService } from '@/server/services';
import { ServerError } from '@/server/error';
import { type UserForGoogleCreate, type UserForLocalCreate } from './types';
import { createUserDTO } from './utils';
import db from '@/server/db/model';
import { Logger } from '@/server/logger';
import { RequestContext } from '@/server/utils/reqwest/context';

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
            log.trace('createUser - email already taken', { email });
            throw new ServerError('auth.error.email-already-taken', 409);
        }

        if (!availability.username) {
            log.trace('createUser - username already taken', { username });
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
    //$                                       GET SHOPPING LIST                                  $//
    //~-----------------------------------------------------------------------------------------~//

    async getShoppingList(userId: number): Promise<ShoppingListDTO[]> {
        log.trace('getShoppingList - attempt', { userId });

        if (RequestContext.getUserId() !== userId) {
            log.warn('getShoppingList - user not found');
            throw new ServerError('auth.error.unauthorized', 401);
        }

        const shoppingList = await db.shoppingList.getShoppingList(userId);

        const recipeIdList = shoppingList.map((item) => item.recipeId);
        const uniqueRecipeIdList = [...new Set(recipeIdList)];

        const shoppingListByRecipeId: ShoppingListDTO[] = [];

        for (const recipeId of uniqueRecipeIdList) {
            const recipe = await db.recipe.getOneById(recipeId);

            if (!recipe || !recipe.displayId || !recipe.title || !recipe.id) {
                log.warn('getShoppingList - recipe not found', { recipeId });
                throw new ServerError('app.error.bad-request', 400);
            }

            const ingredients = shoppingList.filter(
                (item) => item.recipeId === recipeId
            );

            const recipeDTO = {
                id: recipe.id,
                displayId: recipe.displayId,
                title: recipe.title,
                portionSize: recipe.portionSize
            };

            shoppingListByRecipeId.push({
                recipe: recipeDTO,
                ingredients
            });
        }

        log.trace('getShoppingList - success');

        return shoppingListByRecipeId;
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                     CREATE SHOPPING LIST                                $//
    //~-----------------------------------------------------------------------------------------~//

    async createShoppingList(
        userId: number,
        recipeId: number,
        ingredients: ShoppingListIngredientPayload[]
    ): Promise<ShoppingListDTO[]> {
        log.trace('createShoppingList - attempt', { recipeId, ingredients });

        if (
            !recipeId ||
            !Array.isArray(ingredients) ||
            ingredients.length === 0
        ) {
            log.warn('createShoppingList - missing required fields', {
                recipeId,
                ingredients
            });

            throw new ServerError('app.error.bad-request', 400);
        }

        if (RequestContext.getUserId() !== userId) {
            log.warn('createShoppingList - user not found');
            throw new ServerError('auth.error.unauthorized', 401);
        }

        for (const i of ingredients) {
            const ingredient = await db.ingredient.getOneById(i.id);

            if (!ingredient) {
                log.warn('createShoppingList - ingredient not found', {
                    ingredientId: i.id
                });

                throw new ServerError('app.error.bad-request', 400);
            }
        }

        await db.shoppingList.upsertShoppingList(userId, recipeId, ingredients);

        log.trace('createShoppingList - success', {
            recipeId,
            ingredients
        });

        const result = this.getShoppingList(userId);

        return result;
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                    UPDATE SHOPPING LIST                                 $//
    //~-----------------------------------------------------------------------------------------~//

    async updateShoppingList(
        userId: number,
        recipeId: number,
        updates: ShoppingListIngredientPayload[]
    ): Promise<ShoppingListDTO[]> {
        log.trace('updateShoppingListOrder - attempt', { updates });

        if (!Array.isArray(updates)) {
            log.warn('updateShoppingListOrder - missing required fields', {
                updates
            });

            throw new ServerError('app.error.bad-request', 400);
        }

        if (!recipeId) {
            log.warn('updateShoppingListOrder - missing required fields', {
                recipeId
            });

            throw new ServerError('app.error.bad-request', 400);
        }

        if (RequestContext.getUserId() !== userId) {
            log.warn('updateShoppingListOrder - user not found');
            throw new ServerError('auth.error.unauthorized', 401);
        }

        await db.shoppingList.deleteShoppingList(userId, recipeId);

        if (updates.length === 0) {
            log.trace('updateShoppingListOrder - no updates', { updates });
            return [];
        }

        await db.shoppingList.upsertShoppingList(userId, recipeId, updates);

        log.trace('updateShoppingListOrder - success', { updates });

        const result = this.getShoppingList(userId);

        return result;
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                     DELETE SHOPPING LIST                                $//
    //~-----------------------------------------------------------------------------------------~//

    async deleteShoppingList(userId: number, recipeId: number): Promise<void> {
        log.trace('deleteShoppingList - attempt', { recipeId });

        if (RequestContext.getUserId() !== userId) {
            log.warn('deleteShoppingList - user not found');
            throw new ServerError('auth.error.unauthorized', 401);
        }

        await db.shoppingList.deleteShoppingList(userId, recipeId);

        log.trace('deleteShoppingList - success');

        return;
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                    GET LAST VIEWED RECIPES                              $//
    //~-----------------------------------------------------------------------------------------~//

    async getLastViewedRecipes(userId: number): Promise<RecipeForDisplayDTO[]> {
        log.trace('getLastViewedRecipes - attempt', { userId });

        if (userId !== RequestContext.getUserId()) {
            log.warn('getLastViewedRecipes - user not found');
            throw new ServerError('auth.error.unauthorized', 401);
        }

        const recipes = await db.user.getLastViewedRecipes(userId);

        if (!recipes || recipes.length === 0) {
            log.warn('getLastViewedRecipes - no recipes found');
            return [];
        }

        const recipeDTOs: RecipeForDisplayDTO[] = recipes.map((recipe) => ({
            id: recipe.id,
            displayId: recipe.displayId,
            title: recipe.title,
            imageUrl: recipe.imageUrl ?? '',
            rating: recipe.rating ? Number(recipe.rating) : null,
            timesRated: recipe.timesRated,
            time: recipe.time,
            portionSize: recipe.portionSize
        }));

        return recipeDTOs;
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

    //~-----------------------------------------------------------------------------------------~//
    //$                                SEND PASSWORD RESET EMAIL                                $//
    //~-----------------------------------------------------------------------------------------~//

    /**
     * Sends a password reset email to a user.
     * It generates a new token and sends it to the user's email.
     *
     * @param email - The email address of the user.
     * @throws {ServerError} Throws an error if the email is missing, not verified or the user is not found.
     */
    async sendPasswordResetEmail(email: string): Promise<void> {
        log.trace('sendPasswordResetEmail - attempt', { email });

        if (!email) {
            log.warn('sendPasswordResetEmail - missing email', { email });
            throw new ServerError('auth.error.email-required', 400);
        }

        const user = await db.user.getOneByEmail(email);

        if (!user) {
            log.info('sendPasswordResetEmail - user not found', { email });
            throw new ServerError('auth.error.user-not-found', 404);
        }

        if (!user.emailVerified) {
            log.warn('sendPasswordResetEmail - email not verified', { email });
            throw new ServerError('auth.error.email-not-verified', 400);
        }

        if (user.authType === AuthType.Google) {
            log.info(
                'sendPasswordResetEmail - tried for user with google auth',
                { email }
            );
            throw new ServerError('auth.error.google-auth-not-supported', 400);
        }

        const passwordResetToken = uuid();
        const passwordResetTokenExpires = new Date(
            Date.now() + 1000 * 60 * 60 * 24 // 24 hours
        );

        await db.user.updateOneById(user.id, {
            passwordResetToken,
            passwordResetTokenExpires
        });

        await mailService.sendPasswordReset(
            user.email,
            user.username,
            passwordResetToken
        );

        log.trace('sendPasswordResetEmail - success', { email });

        return;
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                     RESET PASSWORD                                      $//
    //~-----------------------------------------------------------------------------------------~//

    /**
     * Resets a user's password using a password reset token.
     *
     * @param token - The password reset token.
     * @param password - The new password.
     */

    async resetPassword(token: string, password: string): Promise<void> {
        log.trace('resetPassword - attempt');

        if (!token || !password) {
            log.warn('resetPassword - missing token or password');
            throw new ServerError('app.error.bad-request', 400);
        }

        const user = await db.user.getOneByPasswordResetToken(token);

        if (!user) {
            log.warn('resetPassword - user not found');
            throw new ServerError('auth.error.user-not-found', 404);
        }

        if (user.authType === AuthType.Google) {
            log.info('resetPassword - tried for user with google auth');
            throw new ServerError('auth.error.google-auth-not-supported', 400);
        }

        if (
            user.passwordResetTokenExpires &&
            user.passwordResetTokenExpires < new Date()
        ) {
            log.trace('resetPassword - token expired');
            throw new ServerError(
                'auth.error.password-reset-token-expired',
                400
            );
        }

        if (
            user?.lastPasswordReset &&
            user.lastPasswordReset > new Date(Date.now() - 1000 * 60 * 60 * 24)
        ) {
            log.warn('resetPassword - password changed too recently');
            throw new ServerError(
                'auth.error.password-changed-too-recently',
                400
            );
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await db.user.updateOneById(user.id, {
            passwordHash: hashedPassword,
            passwordResetToken: null,
            passwordResetTokenExpires: null,
            lastPasswordReset: new Date()
        });

        log.notice('resetPassword - success');

        return;
    }
}

export const userService = new UserService();
