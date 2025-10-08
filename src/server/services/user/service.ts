import { AuthType, Status, UserRole } from '@/common/types';
import type {
    RecipeForDisplayDTO,
    ShoppingListDTO,
    ShoppingListIngredientPayload,
    UserDTO,
    UserForCreatePayload,
    UserForGoogleCreatePayload,
    UserPreferences
} from '@/common/types';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { mailService } from '@/server/services';
import {
    AuthErrorForbidden,
    ConflictError,
    NotFoundError,
    ServerError,
    ValidationError
} from '@/server/error';
import { type UserForGoogleCreate, type UserForLocalCreate } from './types';
import { createUserDTO, getUserDataPermissionGroups } from './utils';
import db, { getUserSelect } from '@/server/db/model';
import { Logger } from '@/server/logger';
import { LogServiceMethod } from '@/server/logger';
import { ApplicationErrorCode } from '@/server/error/codes';
import type {
    ConsentCategory,
    CookieConsent,
    CookieConsentForCreate
} from '@/common/types/cookie-consent';
import type { TermsAcceptanceForCreate } from '@/common/types';
import { ONE_DAY_IN_MILLISECONDS } from '@/common/constants';
import { areConsentsEqual } from '@/common/utils';
import { generateProofHash } from '@/server/utils/crypto';
import { serializeTermsContent } from '@/server/utils/terms';
import { serializeConsentContent } from '@/server/utils/consent';

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
    @LogServiceMethod({ success: 'notice', names: ['payload'] })
    async createUser(payload: UserForCreatePayload): Promise<UserDTO> {
        const { email, password, username } = payload;

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
            throw new ConflictError(
                'auth.error.email-already-taken',
                ApplicationErrorCode.CONFLICT
            );
        }

        if (!availability.username) {
            log.trace('createUser - username already taken', { username });
            throw new ConflictError(
                'auth.error.username-already-taken',
                ApplicationErrorCode.CONFLICT
            );
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
    @LogServiceMethod({ success: 'notice', names: ['payload'] })
    async createUserFromGoogle(
        payload: UserForGoogleCreatePayload
    ): Promise<UserDTO> {
        const { email, username, avatarUrl } = payload;

        // This method only cares whether the email is already taken
        const userSelect = getUserSelect(['public']);
        const existingUser = await db.user.getOneByEmail(email, userSelect);

        if (existingUser) {
            log.info('createUserFromGoogle - user already exists', { email });

            throw new ConflictError(
                'auth.error.user-already-exists',
                ApplicationErrorCode.USER_ALREADY_EXISTS
            );
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

    //~-----------------------------------------------------------------------------------------~//
    //$                                           GET BY ID                                     $//
    //~-----------------------------------------------------------------------------------------~//

    @LogServiceMethod({ names: ['id'] })
    async getUserById(id: number): Promise<UserDTO> {
        const groups = getUserDataPermissionGroups(id);
        const select = getUserSelect(groups);

        const user = await db.user.getOneById(id, select);

        if (!user) {
            log.warn('getUserById - user not found', { id });
            throw new NotFoundError(
                'app.error.not-found',
                ApplicationErrorCode.USER_NOT_FOUND
            );
        }

        const userResponse = createUserDTO(user);

        return userResponse;
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                       GET SHOPPING LIST                                 $//
    //~-----------------------------------------------------------------------------------------~//

    @LogServiceMethod({ names: ['userId'] })
    async getShoppingList(userId: number): Promise<ShoppingListDTO[]> {
        const shoppingList = await db.shoppingList.getShoppingList(userId);

        const recipeIdList = shoppingList.map((item) => item.recipeId);
        const uniqueRecipeIdList = [...new Set(recipeIdList)];

        const shoppingListByRecipeId: ShoppingListDTO[] = [];

        for (const recipeId of uniqueRecipeIdList) {
            const recipe = await db.recipe.getOneById(recipeId);

            if (!recipe || !recipe.displayId || !recipe.title || !recipe.id) {
                log.warn('getShoppingList - recipe not found', { recipeId });
                throw new NotFoundError(
                    'app.error.not-found',
                    ApplicationErrorCode.RECIPE_NOT_FOUND
                );
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

        return shoppingListByRecipeId;
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                     CREATE SHOPPING LIST                                $//
    //~-----------------------------------------------------------------------------------------~//

    @LogServiceMethod({ names: ['userId', 'recipeId', 'ingredients'] })
    async createShoppingList(
        userId: number,
        recipeId: number,
        ingredients: ShoppingListIngredientPayload[]
    ): Promise<ShoppingListDTO[]> {
        if (
            !recipeId ||
            !Array.isArray(ingredients) ||
            ingredients.length === 0
        ) {
            log.warn('createShoppingList - missing required fields', {
                recipeId,
                ingredients
            });

            throw new ValidationError(
                undefined,
                ApplicationErrorCode.MISSING_FIELD
            );
        }

        for (const i of ingredients) {
            const ingredient = await db.ingredient.getOneById(i.id);

            if (!ingredient) {
                log.warn('createShoppingList - ingredient not found', {
                    ingredientId: i.id
                });

                throw new ValidationError(
                    undefined,
                    ApplicationErrorCode.MISSING_FIELD
                );
            }
        }

        await db.shoppingList.upsertShoppingList(userId, recipeId, ingredients);

        const result = this.getShoppingList(userId);

        return result;
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                    UPDATE SHOPPING LIST                                 $//
    //~-----------------------------------------------------------------------------------------~//

    @LogServiceMethod({ names: ['userId', 'recipeId', 'updates'] })
    async updateShoppingList(
        userId: number,
        recipeId: number,
        updates: ShoppingListIngredientPayload[]
    ): Promise<ShoppingListDTO[]> {
        if (!Array.isArray(updates)) {
            log.warn('updateShoppingListOrder - missing required fields', {
                updates
            });

            throw new ValidationError(
                undefined,
                ApplicationErrorCode.MISSING_FIELD
            );
        }

        if (!recipeId) {
            log.warn('updateShoppingListOrder - missing required fields', {
                recipeId
            });

            throw new ValidationError(
                undefined,
                ApplicationErrorCode.MISSING_FIELD
            );
        }

        await db.shoppingList.deleteShoppingList(userId, recipeId);

        if (updates.length === 0) {
            log.trace('updateShoppingListOrder - no updates', { updates });
            return [];
        }

        await db.shoppingList.upsertShoppingList(userId, recipeId, updates);

        const result = this.getShoppingList(userId);

        return result;
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                     DELETE SHOPPING LIST                                $//
    //~-----------------------------------------------------------------------------------------~//

    @LogServiceMethod({ names: ['userId', 'recipeId'] })
    async deleteShoppingList(userId: number, recipeId?: number): Promise<void> {
        await db.shoppingList.deleteShoppingList(userId, recipeId);

        return;
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                    GET LAST VIEWED RECIPES                              $//
    //~-----------------------------------------------------------------------------------------~//

    @LogServiceMethod({ names: ['userId'] })
    async getLastViewedRecipes(userId: number): Promise<RecipeForDisplayDTO[]> {
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
    //$                                     UPDATE ONE BY ID                                    $//
    //~-----------------------------------------------------------------------------------------~//

    @LogServiceMethod({ names: ['userId', 'payload'] })
    async updateOneById(
        userId: number,
        payload: Partial<UserForCreatePayload>
    ): Promise<UserDTO> {
        const user = await db.user.updateOneById(userId, payload);

        if (!user) {
            log.warn('updateOneById - user not found');
            throw new NotFoundError(
                'app.error.not-found',
                ApplicationErrorCode.USER_NOT_FOUND
            );
        }

        const userResponse = createUserDTO(user);

        return userResponse;
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                   CREATE COOKIE CONSENT                                 $//
    //~-----------------------------------------------------------------------------------------~//

    @LogServiceMethod({ names: ['userId', 'payload'] })
    async createUserCookieConsent(
        userId: number,
        payload: CookieConsentForCreate
    ): Promise<CookieConsent> {
        const user = await this.getUserById(userId);

        if (!user) {
            log.warn('createUserCookieConsent - user not found', { userId });
            throw new NotFoundError(
                'app.error.not-found',
                ApplicationErrorCode.USER_NOT_FOUND
            );
        }

        // if the new payload matches the latest stored consent, skip the write.
        const latestConsent =
            user.cookieConsent &&
            Array.isArray(user.cookieConsent) &&
            user.cookieConsent.length > 0
                ? user.cookieConsent[0]
                : null;

        if (
            latestConsent !== null &&
            areConsentsEqual(latestConsent, payload)
        ) {
            log.trace(
                'createUserCookieConsent - duplicate consent, skipping DB write',
                {
                    userId
                }
            );

            const consentDto: CookieConsent = {
                id: latestConsent.id.toString(),
                userId: latestConsent.userId.toString(),
                consent: latestConsent.consent,
                accepted: latestConsent.accepted as ConsentCategory[],
                version: latestConsent.version,
                userIpAddress: latestConsent.userIpAddress ?? '',
                userAgent: latestConsent.userAgent ?? '',
                createdAt: latestConsent.createdAt,
                revokedAt: latestConsent.revokedAt ?? null,
                updatedAt: latestConsent.updatedAt
            };

            return consentDto;
        }

        // From here on, the consent is fresh new, revoke the previous if any and save the new one.

        try {
            // db should always return only the latest cookie consent
            if (latestConsent) {
                await db.user.revokeUserCookieConsent(
                    Number(latestConsent.id),
                    userId
                );
            }
        } catch (error) {
            log.error(
                'createUserCookieConsent - error revoking user cookie consent',
                { userId, error }
            );

            /**
             * Do NOT continue if the revocation fails.
             * Allowing this to continue would result in a duplicate consent, which sounds really bad.
             */
            throw new ServerError(
                'app.error.default',
                500,
                ApplicationErrorCode.DEFAULT
            );
        }

        const consent = await db.user.createUserCookieConsent(userId, payload);

        const consentDto: CookieConsent = {
            id: consent.id.toString(),
            userId: consent.userId.toString(),
            consent: consent.consent,
            accepted: consent.accepted as ConsentCategory[],
            version: consent.version,
            userIpAddress: consent.userIpAddress ?? '',
            userAgent: consent.userAgent ?? '',
            createdAt: consent.createdAt,
            revokedAt: consent.revokedAt ?? null,
            updatedAt: consent.updatedAt
        };

        return consentDto;
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                  CREATE TERMS ACCEPTANCE                                $//
    //~-----------------------------------------------------------------------------------------~//

    @LogServiceMethod({ names: ['userId', 'payload'] })
    async createUserTermsAcceptance(
        userId: number,
        payload: TermsAcceptanceForCreate
    ): Promise<void> {
        const user = await this.getUserById(userId);

        if (!user) {
            log.warn('createUserTermsAcceptance - user not found', { userId });
            throw new NotFoundError(
                'app.error.not-found',
                ApplicationErrorCode.USER_NOT_FOUND
            );
        }

        // Get the latest active terms acceptance if any
        const latestTermsAcceptance =
            user.termsAcceptance &&
            Array.isArray(user.termsAcceptance) &&
            user.termsAcceptance.length > 0
                ? user.termsAcceptance[0]
                : null;

        try {
            if (latestTermsAcceptance) {
                await db.user.revokeUserTermsAcceptance(
                    Number(latestTermsAcceptance.id),
                    userId
                );
            }
        } catch (error) {
            log.error(
                'createUserTermsAcceptance - error revoking previous terms acceptance',
                { userId, error }
            );

            /**
             * Do NOT continue if the revocation fails.
             * Allowing this to continue would result in multiple active terms acceptances.
             */
            throw new ServerError(
                'app.error.default',
                500,
                ApplicationErrorCode.DEFAULT
            );
        }

        // Create the record
        try {
            await db.user.createUserTermsAcceptance(userId, payload);
        } catch (error) {
            log.error(
                'createUserTermsAcceptance - error creating terms acceptance',
                { userId, error }
            );

            throw new ServerError(
                'app.error.default',
                500,
                ApplicationErrorCode.DEFAULT
            );
        }
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                              VERIFY TERMS ACCEPTANCE HASH                               $//
    //~-----------------------------------------------------------------------------------------~//

    /**
     * Verifies the proof hash of a terms acceptance record by regenerating
     * the hash from the stored data and comparing it with the stored hash.
     *
     * @param userId - The ID of the user who owns the terms acceptance
     * @param acceptanceId - The ID of the terms acceptance record to verify
     * @returns Verification result with validity status and details
     */
    @LogServiceMethod({ names: ['userId', 'acceptanceId'] })
    async verifyTermsAcceptanceHash(
        userId: number,
        acceptanceId: number
    ): Promise<{
        valid: boolean;
        details: {
            version: string;
            createdAt: Date;
            verified: Date;
            storedHash: string;
            computedHash?: string;
        };
    }> {
        const termsAcceptance =
            await db.user.getLatestUserTermsAcceptance(userId);

        if (!termsAcceptance) {
            log.warn('verifyTermsAcceptanceHash - record not found', {
                userId,
                acceptanceId
            });
            throw new NotFoundError(
                'app.error.not-found',
                ApplicationErrorCode.NOT_FOUND
            );
        }

        if (termsAcceptance.userId !== userId) {
            log.warn('verifyTermsAcceptanceHash - unauthorized access', {
                userId,
                acceptanceId,
                recordUserId: termsAcceptance.userId
            });
            throw new AuthErrorForbidden(
                'auth.error.forbidden',
                ApplicationErrorCode.FORBIDDEN
            );
        }

        const storedHash = termsAcceptance.proofHash;

        const termsText = serializeTermsContent();
        const computedHash = generateProofHash({
            text: termsText,
            userId: termsAcceptance.userId,
            timestamp: termsAcceptance.createdAt
        });

        const valid = storedHash === computedHash;

        log.trace('verifyTermsAcceptanceHash - verification complete', {
            userId,
            acceptanceId,
            valid,
            storedHash,
            computedHash
        });

        return {
            valid,
            details: {
                version: termsAcceptance.version,
                createdAt: termsAcceptance.createdAt,
                verified: new Date(),
                storedHash,
                computedHash: valid ? undefined : computedHash
            }
        };
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                              VERIFY COOKIE CONSENT HASH                                 $//
    //~-----------------------------------------------------------------------------------------~//

    /**
     * Verifies the proof hash of a cookie consent record by regenerating
     * the hash from the stored data and comparing it with the stored hash.
     *
     * @param userId - The ID of the user who owns the cookie consent
     * @param consentId - The ID of the cookie consent record to verify
     * @returns Verification result with validity status and details
     */
    @LogServiceMethod({ names: ['userId', 'consentId'] })
    async verifyCookieConsentHash(
        userId: number,
        consentId: number
    ): Promise<{
        valid: boolean;
        details: {
            version: string;
            createdAt: Date;
            verified: Date;
            accepted: string[];
            storedHash: string;
            computedHash?: string;
        };
    }> {
        const cookieConsent = await db.user.getLatestUserCookieConsent(userId);

        console.log(cookieConsent);
        console.log(userId);
        console.log(consentId);

        if (!cookieConsent) {
            log.warn('verifyCookieConsentHash - record not found', {
                userId,
                consentId
            });
            throw new NotFoundError(
                'app.error.not-found',
                ApplicationErrorCode.NOT_FOUND
            );
        }

        if (cookieConsent.userId !== userId) {
            log.warn('verifyCookieConsentHash - unauthorized access', {
                userId,
                consentId,
                recordUserId: cookieConsent.userId
            });

            throw new AuthErrorForbidden(
                'auth.error.forbidden',
                ApplicationErrorCode.FORBIDDEN
            );
        }

        const storedHash = cookieConsent.proofHash;

        // Regenerate the hash from stored data
        const consentText = serializeConsentContent();
        const computedHash = generateProofHash({
            text: consentText,
            userId: cookieConsent.userId,
            timestamp: cookieConsent.createdAt,
            accepted: cookieConsent.accepted
        });
        console.log(storedHash);
        console.log(computedHash);

        const valid = storedHash === computedHash;

        log.trace('verifyCookieConsentHash - verification complete', {
            userId,
            consentId,
            valid,
            storedHash,
            computedHash
        });

        return {
            valid,
            details: {
                version: cookieConsent.version,
                createdAt: cookieConsent.createdAt,
                verified: new Date(),
                accepted: cookieConsent.accepted,
                storedHash,
                computedHash: valid ? undefined : computedHash
            }
        };
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                 UPDATE USER PREFERENCES                                 $//
    //~-----------------------------------------------------------------------------------------~//

    @LogServiceMethod({ names: ['userId', 'preferences'] })
    async updateUserPreferences(
        userId: number,
        preferences: UserPreferences
    ): Promise<void> {
        const user = await this.getUserById(userId);

        if (!user) {
            log.warn('updateUserPreferences - user not found', { userId });
            throw new NotFoundError(
                'app.error.not-found',
                ApplicationErrorCode.USER_NOT_FOUND
            );
        }

        // The Prisma projection returns `preferences` as `{ settings: UserPreferences }`.
        // Flatten it, so we only merge plain key-value pairs.
        const currentSettings: UserPreferences =
            user.preferences && 'settings' in (user.preferences as any)
                ? ((user.preferences as any).settings as UserPreferences)
                : (user.preferences as UserPreferences);

        const preferencesForUpdate = {
            ...currentSettings,
            ...preferences
        };

        await db.user.upsertUserPreference(userId, preferencesForUpdate);

        return;
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
    @LogServiceMethod({ success: 'notice', names: ['token'] })
    async verifyEmail(token: string): Promise<void> {
        if (!token) {
            log.warn('verifyEmail - missing token', { token });

            throw new ValidationError(
                'auth.error.missing-token',
                ApplicationErrorCode.MISSING_FIELD
            );
        }

        const user = await db.user.getOneByEmailVerificationToken(token);

        if (!user) {
            log.warn('verifyEmail - user not found', { token });

            throw new NotFoundError(
                'auth.error.user-not-found',
                ApplicationErrorCode.USER_NOT_FOUND
            );
        }

        if (user.emailVerified) {
            log.info('verifyEmail - email already verified', { token });

            throw new AuthErrorForbidden(
                'auth.error.email-already-verified',
                ApplicationErrorCode.EMAIL_ALREADY_VERIFIED
            );
        }

        await db.user.updateOneById(user.id, {
            emailVerified: true,
            emailVerificationToken: null
        });

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
    @LogServiceMethod({ names: ['email'] })
    async resendVerificationEmail(email: string): Promise<void> {
        if (!email) {
            throw new ValidationError(
                'auth.error.email-required',
                ApplicationErrorCode.MISSING_FIELD
            );
        }

        const user = await db.user.getOneByEmail(email, {
            id: true,
            email: true,
            username: true,
            emailVerified: true
        });

        if (!user) {
            log.warn('resendVerificationEmail - user not found', { email });

            throw new NotFoundError(
                'auth.error.user-not-found',
                ApplicationErrorCode.USER_NOT_FOUND
            );
        }

        if (user?.emailVerified) {
            log.info('resendVerificationEmail - email already verified', {
                email
            });

            throw new AuthErrorForbidden(
                'auth.error.email-already-verified',
                ApplicationErrorCode.EMAIL_ALREADY_VERIFIED
            );
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
    @LogServiceMethod({ names: ['email'] })
    async sendPasswordResetEmail(email: string): Promise<void> {
        if (!email) {
            log.warn('sendPasswordResetEmail - missing email', { email });
            throw new ValidationError(
                'auth.error.email-required',
                ApplicationErrorCode.MISSING_FIELD
            );
        }

        const user = await db.user.getOneByEmail(
            email,
            getUserSelect(['self'])
        );

        if (!user) {
            log.info('sendPasswordResetEmail - user not found', { email });
            throw new NotFoundError(
                'auth.error.user-not-found',
                ApplicationErrorCode.USER_NOT_FOUND
            );
        }

        if (!user.emailVerified) {
            log.warn('sendPasswordResetEmail - email not verified', { email });
            throw new AuthErrorForbidden(
                'auth.error.email-not-verified',
                ApplicationErrorCode.EMAIL_NOT_VERIFIED
            );
        }

        if (user.authType === AuthType.Google) {
            log.info(
                'sendPasswordResetEmail - tried for user with google auth',
                { email, authType: user.authType }
            );
            throw new AuthErrorForbidden(
                'auth.error.google-auth-not-supported',
                ApplicationErrorCode.GOOGLE_OAUTH_FAILED
            );
        }

        const passwordResetToken = uuid();
        const passwordResetTokenExpires = new Date(
            Date.now() + ONE_DAY_IN_MILLISECONDS
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

    @LogServiceMethod({ success: 'notice', names: ['token', 'password'] })
    async resetPassword(token: string, password: string): Promise<void> {
        if (!token || !password) {
            log.warn('resetPassword - missing token or password');
            throw new ValidationError(
                undefined,
                ApplicationErrorCode.MISSING_FIELD
            );
        }

        const user = await db.user.getOneByPasswordResetToken(token);

        if (!user) {
            log.warn('resetPassword - user not found');
            throw new NotFoundError(
                'auth.error.user-not-found',
                ApplicationErrorCode.USER_NOT_FOUND
            );
        }

        if (user.authType === AuthType.Google) {
            log.info('resetPassword - tried for user with google auth');
            throw new AuthErrorForbidden(
                'auth.error.google-auth-not-supported',
                ApplicationErrorCode.GOOGLE_OAUTH_FAILED
            );
        }

        if (
            user.passwordResetTokenExpires &&
            user.passwordResetTokenExpires < new Date()
        ) {
            log.trace('resetPassword - token expired');
            throw new ValidationError(
                'auth.error.password-reset-token-expired',
                ApplicationErrorCode.PASSWORD_RESET_TOKEN_EXPIRED
            );
        }

        if (
            user?.lastPasswordReset &&
            user.lastPasswordReset >
                new Date(Date.now() - ONE_DAY_IN_MILLISECONDS)
        ) {
            log.warn('resetPassword - password changed too recently');
            throw new ValidationError(
                'auth.error.password-changed-too-recently',
                ApplicationErrorCode.PRECONDITION_FAILED
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

        return;
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                  INITIATE EMAIL CHANGE                                  $//
    //~-----------------------------------------------------------------------------------------~//

    /**
     * Initiates the email change flow for the authenticated user.
     *
     * @param userId - ID of the user requesting the change (must equal RequestContext.getUserId())
     * @param newEmail - E-mail address that should replace the current one
     * @param currentPassword - The user’s current password (required for local accounts)
     *
     * @throws ValidationError   If required fields are missing or the new email is identical to the existing one
     * @throws ConflictError     If the new email is already taken by a different user
     * @throws AuthErrorForbidden If the password is invalid or password authentication is not possible
     */
    @LogServiceMethod({ success: 'notice', names: ['userId', 'newEmail'] })
    async initiateEmailChange(
        userId: number,
        newEmail: string,
        currentPassword: string
    ): Promise<void> {
        //|-------------------------------------------------------------------------------------|//
        //?                                       GUARDS                                        ?//
        //|-------------------------------------------------------------------------------------|//

        if (!currentPassword) {
            log.warn('initiateEmailChange - missing password');
            throw new ValidationError(
                'auth.error.password-required',
                ApplicationErrorCode.MISSING_FIELD
            );
        }

        const user = await db.user.getOneById(userId, {
            id: true,
            email: true,
            username: true,
            passwordHash: true,
            authType: true,
            emailVerified: true
        });

        if (!user) {
            log.warn('initiateEmailChange - user not found', { userId });
            throw new NotFoundError(
                'app.error.not-found',
                ApplicationErrorCode.USER_NOT_FOUND
            );
        }

        if (newEmail === user.email) {
            log.warn('initiateEmailChange - email unchanged');
            throw new ValidationError(undefined, ApplicationErrorCode.CONFLICT);
        }

        const existing = await db.user.getOneByEmail(newEmail, { id: true });

        if (existing) {
            log.trace('initiateEmailChange - email already in use', {
                newEmail
            });

            throw new ConflictError(
                'auth.error.email-already-taken',
                ApplicationErrorCode.EMAIL_ALREADY_IN_USE
            );
        }

        if (user.authType === AuthType.Local) {
            const matches = await bcrypt.compare(
                currentPassword,
                user.passwordHash ?? ''
            );

            if (!matches) {
                log.warn('initiateEmailChange - invalid password');
                throw new AuthErrorForbidden(
                    undefined,
                    ApplicationErrorCode.INVALID_PASSWORD
                );
            }
        } else {
            // Google-only accounts have no password to compare
            log.warn('initiateEmailChange - password required for google auth');
            throw new AuthErrorForbidden(
                'auth.error.password-required',
                ApplicationErrorCode.INVALID_PASSWORD
            );
        }

        //|-------------------------------------------------------------------------------------|//
        //?                                    TOKEN AND MAIL                                   ?//
        //|-------------------------------------------------------------------------------------|//

        const token = uuid();
        const expiresAt = new Date(Date.now() + ONE_DAY_IN_MILLISECONDS);

        await db.user.upsertEmailChangeRequest(
            userId,
            newEmail,
            token,
            expiresAt
        );

        await mailService.sendEmailChangeConfirmation(
            newEmail,
            token,
            user.username
        );
        await mailService.sendEmailChangeNotice(user.email, user.username);
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                  CONFIRM EMAIL CHANGE                                   $//
    //~-----------------------------------------------------------------------------------------~//

    /**
     * Confirms email change request by token, swaps the e-mail in the DB and sends an audit mail.
     *
     * @param token - The confirmation token supplied in the confirmation link
     * @returns The updated `UserDTO` object.
     */
    @LogServiceMethod({ success: 'notice', names: ['token'] })
    async confirmEmailChange(token: string): Promise<UserDTO> {
        //|-------------------------------------------------------------------------------------|//
        //?                                       GUARDS                                        ?//
        //|-------------------------------------------------------------------------------------|//

        const request = await db.user.getEmailChangeRequestByToken(token);

        if (!request) {
            log.warn('confirmEmailChange - request not found');
            throw new ValidationError(
                undefined,
                ApplicationErrorCode.EMAIL_CHANGE_TOKEN_EXPIRED
            );
        }

        if (request.expiresAt < new Date()) {
            log.trace('confirmEmailChange - token expired');
            throw new ValidationError(
                undefined,
                ApplicationErrorCode.EMAIL_CHANGE_TOKEN_EXPIRED
            );
        }

        const user = await db.user.getOneById(request.userId, {
            id: true,
            email: true,
            username: true
        });

        if (!user) {
            log.error('confirmEmailChange - user not found', {
                userId: request.userId
            });

            throw new NotFoundError(
                'app.error.not-found',
                ApplicationErrorCode.USER_NOT_FOUND
            );
        }

        //|-------------------------------------------------------------------------------------|//
        //?                                      CHANGE                                         ?//
        //|-------------------------------------------------------------------------------------|//

        const oldEmail = user.email;

        await db.user.applyEmailChange(user.id, request.newEmail, token);

        //|-------------------------------------------------------------------------------------|//
        //?                                 AUDIT NOTIFICATION                                  ?//
        ///
        //# Send audit email outside the DB transaction. If the job enqueue fails we
        //# do not want to roll back the already committed email change, that would
        //# leave the system in an inconsistent state from the user’s perspective.
        ///
        //|-------------------------------------------------------------------------------------|//

        try {
            await mailService.sendEmailChangedAudit(
                oldEmail,
                request.newEmail,
                user.username
            );
        } catch (mailError: unknown) {
            log.error('confirmEmailChange - failed to enqueue audit email', {
                mailError,
                userId: user.id,
                token
            });
        }

        const updated = await db.user.getOneById(
            user.id,
            getUserSelect(['public'])
        );

        if (!updated) {
            throw new ServerError(
                'app.error.default',
                500,
                ApplicationErrorCode.DEFAULT
            );
        }

        return createUserDTO(updated);
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                  ACCOUNT DELETION LIFECYCLE                              $//
    //~-----------------------------------------------------------------------------------------~//

    /**
     * Initiate account deletion for a user
     *
     * @param userId - The ID of the user requesting deletion
     * @param password - The user's current password (for local auth)
     * @param reason - Optional reason for deletion
     * @param ipAddress - IP address of the request
     * @param userAgent - User agent of the request
     * @returns Deletion scheduled date and days remaining
     */
    @LogServiceMethod({
        success: 'notice',
        names: ['userId', 'reason']
    })
    async initiateAccountDeletion(
        userId: number,
        password: string,
        reason?: string,
        ipAddress?: string,
        userAgent?: string
    ): Promise<{ scheduledFor: Date; daysRemaining: number }> {
        //|-------------------------------------------------------------------------------------|//
        //?                                       GUARDS                                        ?//
        //|-------------------------------------------------------------------------------------|//

        const user = await db.user.getOneById(userId, {
            id: true,
            email: true,
            username: true,
            passwordHash: true,
            authType: true,
            status: true
        });

        if (!user) {
            log.warn('initiateAccountDeletion - user not found', { userId });
            throw new NotFoundError(
                'app.error.not-found',
                ApplicationErrorCode.USER_NOT_FOUND
            );
        }

        if (user.status === 'pending_deletion') {
            log.warn('initiateAccountDeletion - deletion already pending', {
                userId
            });
            throw new ConflictError(undefined, ApplicationErrorCode.CONFLICT);
        }

        // Verify password for local auth users
        if (user.authType === AuthType.Local) {
            if (!password) {
                log.warn('initiateAccountDeletion - password required');
                throw new ValidationError(
                    'auth.error.password-required',
                    ApplicationErrorCode.MISSING_FIELD
                );
            }

            const matches = await bcrypt.compare(
                password,
                user.passwordHash ?? ''
            );

            if (!matches) {
                log.warn('initiateAccountDeletion - invalid password');
                throw new AuthErrorForbidden(
                    undefined,
                    ApplicationErrorCode.INVALID_PASSWORD
                );
            }
        }

        //|-------------------------------------------------------------------------------------|//
        //?                                    SET DELETION                                     ?//
        //|-------------------------------------------------------------------------------------|//

        const GRACE_PERIOD_DAYS = 30;
        const scheduledFor = new Date();
        scheduledFor.setDate(scheduledFor.getDate() + GRACE_PERIOD_DAYS);

        await db.user.markForDeletion(userId, scheduledFor);

        const proofHash = await bcrypt.hash(
            `${userId}-${scheduledFor.toISOString()}`,
            10
        );

        await db.accountDeletionRequest.createOne({
            user: { connect: { id: userId } },
            ipAddress: ipAddress ?? null,
            userAgent: userAgent ?? null,
            reason: reason ?? null,
            proofHash,
            userEmail: user.email,
            userName: user.username
        });

        //|-------------------------------------------------------------------------------------|//
        //?                                   SEND EMAIL                                        ?//
        //|-------------------------------------------------------------------------------------|//

        try {
            await mailService.sendAccountDeletionConfirmation(
                user.email,
                user.username,
                scheduledFor.toISOString()
            );
        } catch (error) {
            log.error('Failed to send account deletion confirmation email', {
                error,
                userId
            });
            // Don't fail the operation if email fails
        }

        return {
            scheduledFor,
            daysRemaining: GRACE_PERIOD_DAYS
        };
    }

    /**
     * Cancel account deletion for a user
     * Restores Active status, clears deletion fields, updates audit record
     *
     * @param userId - The ID of the user canceling deletion
     */
    @LogServiceMethod({ success: 'notice', names: ['userId'] })
    async cancelAccountDeletion(userId: number): Promise<void> {
        //|-------------------------------------------------------------------------------------|//
        //?                                       GUARDS                                        ?//
        //|-------------------------------------------------------------------------------------|//

        const user = await db.user.getOneById(userId, {
            id: true,
            email: true,
            username: true,
            status: true,
            deletionScheduledFor: true
        });

        if (!user) {
            log.warn('cancelAccountDeletion - user not found', { userId });
            throw new NotFoundError(
                'app.error.not-found',
                ApplicationErrorCode.USER_NOT_FOUND
            );
        }

        if (user.status !== 'pending_deletion') {
            log.warn('cancelAccountDeletion - user not pending deletion', {
                userId
            });
            throw new ValidationError(
                undefined,
                ApplicationErrorCode.PRECONDITION_FAILED
            );
        }

        // Check if still within grace period
        const deletionDate = user.deletionScheduledFor
            ? new Date(user.deletionScheduledFor)
            : null;
        if (deletionDate && deletionDate < new Date()) {
            log.warn('cancelAccountDeletion - grace period expired', {
                userId
            });
            throw new ValidationError(
                undefined,
                ApplicationErrorCode.PRECONDITION_FAILED
            );
        }

        //|-------------------------------------------------------------------------------------|//
        //?                                  CANCEL DELETION                                    ?//
        //|-------------------------------------------------------------------------------------|//

        // Restore user to active status
        await db.user.cancelDeletion(userId);

        // Update audit record
        const auditRecord =
            await db.accountDeletionRequest.getLatestByUserId(userId);
        if (auditRecord) {
            await db.accountDeletionRequest.markAsCancelled(auditRecord.id);
        }

        //|-------------------------------------------------------------------------------------|//
        //?                                   SEND EMAIL                                        ?//
        //|-------------------------------------------------------------------------------------|//

        try {
            await mailService.sendAccountDeletionCancelled(
                user.email,
                user.username
            );
        } catch (error) {
            log.error('Failed to send account deletion cancelled email', {
                error,
                userId
            });
            // Don't fail the operation if email fails
        }

        return;
    }

    /**
     * Process scheduled deletions - hard delete users past their grace period
     * This method should be called by a cron job
     */
    @LogServiceMethod({ success: 'notice' })
    async processScheduledDeletions(): Promise<{
        processed: number;
        failed: number;
    }> {
        log.info('processScheduledDeletions - starting');

        const usersPendingDeletion =
            await db.user.getUsersPendingHardDeletion();

        let processed = 0;
        let failed = 0;

        for (const user of usersPendingDeletion) {
            try {
                log.info('Processing hard deletion for user', {
                    userId: user.id
                });

                // Execute complete hard deletion through the model layer
                await db.user.executeHardDeletion(user.id);

                processed++;

                //|-------------------------------------------------------------------------------------|//
                //?                                   SEND EMAIL                                        ?//
                //|-------------------------------------------------------------------------------------|//

                try {
                    await mailService.sendAccountDeleted(
                        user.email,
                        user.username
                    );
                } catch (error) {
                    log.error('Failed to send account deleted email', {
                        error,
                        userId: user.id
                    });
                    // Don't fail the operation if email fails
                }

                log.info('Successfully processed hard deletion for user', {
                    userId: user.id
                });
            } catch (error) {
                log.error('Failed to process hard deletion for user', {
                    error,
                    userId: user.id
                });
                failed++;
            }
        }

        log.info('processScheduledDeletions - completed', {
            total: usersPendingDeletion.length,
            processed,
            failed
        });

        return { processed, failed };
    }
}

export const userService = new UserService();
