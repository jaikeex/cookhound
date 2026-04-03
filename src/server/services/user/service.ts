import { AuthType, Status, UserRole } from '@/common/types';
import type {
    RecipeForDisplayDTO,
    ShoppingListDTO,
    ShoppingListIngredientPayload,
    TermsAcceptanceForVerifyDTO,
    UserDTO,
    UserForCreatePayload,
    UserForGoogleCreatePayload,
    UserPreferences
} from '@/common/types';
import { v4 as uuid } from 'uuid';
import { createHash, timingSafeEqual } from 'crypto';
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
    CookieConsentForCreate,
    CookieConsentForVerifyDTO
} from '@/common/types/cookie-consent';
import type { TermsAcceptanceForCreate } from '@/common/types';
import { DEFAULT_LOCALE, ONE_DAY_IN_MILLISECONDS } from '@/common/constants';
import { areConsentsEqual } from '@/common/utils';
import {
    generateProofHash,
    hashPassword,
    verifyPassword
} from '@/server/utils/crypto';
import { serializeTermsContent } from '@/server/utils/terms';
import { serializeConsentContent } from '@/server/utils/consent';
import { RequestContext } from '@/server/utils/reqwest/context';

//|=============================================================================================|//

const log = Logger.getInstance('user-service');

/**
 * Manages user lifecycle operations including registration, authentication,
 * profile management, consent/terms tracking, and account deletion.
 *
 * @see {@link RequestContext} for authenticated user resolution
 */
class UserService {
    //~-----------------------------------------------------------------------------------------~//
    //$                                         CREATE                                          $//
    //~-----------------------------------------------------------------------------------------~//

    //|-----------------------------------------------------------------------------------------|//
    //?                                         MANUAL                                          ?//
    //|-----------------------------------------------------------------------------------------|//

    /**
     * Registers a new user with local (email + password) authentication.
     * Sends a verification email upon successful creation.
     *
     * @param payload - Registration data: email, password, and username.
     * @returns The created user DTO (includes email since the caller is the owner).
     * @throws {ConflictError} If the email or username is already taken.
     */
    @LogServiceMethod({ success: 'notice', excludeArgs: true })
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

        const hashedPassword = await hashPassword(password);
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

        return { ...userResponse, email: user.email };
    }

    //|-----------------------------------------------------------------------------------------|//
    //?                                         GOOGLE                                          ?//
    //|-----------------------------------------------------------------------------------------|//

    /**
     * Registers a new user from a Google OAuth sign-in.
     * The user's email is marked as verified automatically.
     *
     * @param payload - Google profile data: email, username, and avatar URL.
     * @returns The created user DTO.
     * @throws {ConflictError} If a user with the same email already exists.
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

    /**
     * Retrieves a user by their database ID. The returned fields are scoped
     * based on the relationship between the requesting user and the target
     * (self sees more data than a stranger).
     *
     * @param id - Database ID of the user to retrieve.
     * @returns The user DTO with fields appropriate to the caller's permission level.
     * @throws {NotFoundError} If no user with the given ID exists.
     */
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

    /**
     * Retrieves the authenticated user's shopping list, grouped by recipe.
     * Each entry contains the recipe summary and its associated ingredients.
     *
     * @param userId - Database ID of the owning user.
     * @returns Shopping list entries grouped by recipe.
     * @throws {NotFoundError} If a referenced recipe no longer exists.
     */
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

    /**
     * Adds ingredients from a recipe to the user's shopping list.
     * If the recipe already has entries, they are merged.
     *
     * @param userId - Database ID of the owning user.
     * @param recipeId - Recipe the ingredients belong to.
     * @param ingredients - Ingredient entries to add to the list.
     * @returns The full updated shopping list (all recipes).
     * @throws {ValidationError} If the ingredient references are invalid.
     */
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

    /**
     * Replaces the shopping list entries for a specific recipe.
     * If the update list is empty, the recipe's entries are removed entirely.
     *
     * @param userId - Database ID of the owning user.
     * @param recipeId - Recipe whose entries should be replaced.
     * @param updates - New ingredient entries (replaces existing).
     * @returns The full updated shopping list, or an empty array if cleared.
     */
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

    /**
     * Deletes shopping list entries for a user. If a recipe ID is provided,
     * only that recipe's entries are removed; otherwise the entire list is cleared.
     *
     * @param userId - Database ID of the owning user.
     * @param recipeId - Optional recipe to scope the deletion to.
     */
    @LogServiceMethod({ names: ['userId', 'recipeId'] })
    async deleteShoppingList(userId: number, recipeId?: number): Promise<void> {
        await db.shoppingList.deleteShoppingList(userId, recipeId);

        return;
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                    GET LAST VIEWED RECIPES                              $//
    //~-----------------------------------------------------------------------------------------~//

    /**
     * Returns the most recently viewed recipes for a user,
     *
     * @param userId - Database ID of the user.
     * @returns Ordered list of recently viewed recipes, or an empty array if none.
     */
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

    /**
     * Partially updates a user's profile fields.
     *
     * @param userId - Database ID of the user to update.
     * @param payload - Fields to update (only provided keys are changed).
     * @returns The updated user DTO.
     * @throws {NotFoundError} If no user with the given ID exists.
     */
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

    /**
     * Records a new cookie consent decision for a user. If the new consent
     * is identical to the latest stored consent, the write is skipped.
     * Otherwise the previous consent is revoked before persisting the new one.
     *
     * @param userId - Database ID of the consenting user.
     * @param payload - Consent details: categories, version, IP, and user agent.
     * @returns The active cookie consent record (newly created or existing duplicate).
     * @throws {NotFoundError} If the user does not exist.
     * @throws {ServerError} If revoking the previous consent fails (prevents duplicate active consents).
     *
     * @remarks Revocation failure is treated as fatal to avoid duplicate active
     * consent records, which would violate GDPR audit requirements.
     */
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

        if (latestConsent && areConsentsEqual(latestConsent, payload)) {
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

    /**
     * Records a new terms-of-service acceptance for a user.
     * Revokes the previous active acceptance before persisting the new one.
     *
     * @param userId - Database ID of the accepting user.
     * @param payload - Acceptance details: version, proof hash, IP, and user agent.
     * @throws {NotFoundError} If the user does not exist.
     * @throws {ServerError} If revoking the previous acceptance fails (prevents duplicate active records).
     *
     * @remarks Revocation failure is treated as fatal to avoid multiple active
     * acceptance records per user.
     */
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
     * Verifies the integrity of a terms acceptance record by regenerating
     * its proof hash and comparing it to the stored value.
     *
     * @param userId - Database ID of the record owner.
     * @param acceptanceId - ID of the terms acceptance record to verify.
     * @returns Validity flag with version, timestamps, and the computed hash on mismatch.
     * @throws {NotFoundError} If no terms acceptance record exists for the user.
     * @throws {AuthErrorForbidden} If the record belongs to a different user.
     */
    @LogServiceMethod({ names: ['userId', 'acceptanceId'] })
    async verifyTermsAcceptanceHash(
        userId: number,
        acceptanceId: number
    ): Promise<TermsAcceptanceForVerifyDTO> {
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

        const valid = timingSafeEqual(
            Buffer.from(storedHash),
            Buffer.from(computedHash)
        );

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
     * Verifies the integrity of a cookie consent record by regenerating
     * its proof hash and comparing it to the stored value.
     *
     * @param userId - Database ID of the record owner.
     * @param consentId - ID of the cookie consent record to verify.
     * @returns Validity flag with version, timestamps, accepted categories, and the computed hash on mismatch.
     * @throws {NotFoundError} If no cookie consent record exists for the user.
     * @throws {AuthErrorForbidden} If the record belongs to a different user.
     */
    @LogServiceMethod({ names: ['userId', 'consentId'] })
    async verifyCookieConsentHash(
        userId: number,
        consentId: number
    ): Promise<CookieConsentForVerifyDTO> {
        const cookieConsent = await db.user.getLatestUserCookieConsent(userId);

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

        const valid = timingSafeEqual(
            Buffer.from(storedHash),
            Buffer.from(computedHash)
        );

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

    /**
     * Merges new preference values into the user's existing preferences.
     * Only the keys present in the payload are overwritten.
     *
     * @param userId - Database ID of the user.
     * @param preferences - Preference fields to merge.
     * @throws {NotFoundError} If the user does not exist.
     */
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

        const currentSettings: UserPreferences =
            user.preferences && 'settings' in user.preferences
                ? (user.preferences.settings as UserPreferences)
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
     * Confirms a user's email address using the token sent during registration.
     * Clears the verification token on success.
     *
     * @param token - The email verification token from the confirmation link.
     * @throws {NotFoundError} If no user matches the token.
     * @throws {AuthErrorForbidden} If the email is already verified.
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
     * Generates a fresh verification token and resends the verification email.
     * Replaces any previously issued token.
     *
     * @param email - Email address of the user requesting re-verification.
     * @throws {NotFoundError} If no user with the given email exists.
     * @throws {AuthErrorForbidden} If the email is already verified.
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
     * Generates a password reset token and sends a reset link to the user's email.
     *
     * @param email - Email address of the user requesting the reset.
     * @throws {NotFoundError} If no user with the given email exists.
     * @throws {AuthErrorForbidden} If the email is not yet verified or the account uses Google OAuth.
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
     * Sets a new password using a previously issued reset token.
     * Clears the token and records the reset timestamp to enforce a
     * one-reset-per-day cooldown.
     *
     * @param token - The password reset token from the reset link.
     * @param password - The new plaintext password (will be hashed).
     * @throws {NotFoundError} If no user matches the token.
     * @throws {AuthErrorForbidden} If the account uses Google OAuth.
     * @throws {ValidationError} If the token is expired or a reset was performed within the last 24 hours.
     */

    @LogServiceMethod({ success: 'notice', excludeArgs: true })
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

        const hashedPassword = await hashPassword(password);

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
     * Requires password confirmation, then sends a confirmation link to
     * the new address and a notice to the current address.
     *
     * @param userId - Database ID of the requesting user.
     * @param newEmail - Desired replacement email address.
     * @param currentPassword - Current password for identity verification (local auth only).
     * @throws {ValidationError} If the new email is identical to the current one.
     * @throws {ConflictError} If the new email is already taken.
     * @throws {AuthErrorForbidden} If the password is invalid or the account uses Google OAuth.
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
            const matches = await verifyPassword(
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
     * Confirms a pending email change using the token from the confirmation link.
     * Swaps the email in the database and sends an audit notification to
     * both the old and new addresses.
     *
     * @param token - Confirmation token from the email change link.
     * @returns The updated user DTO reflecting the new email.
     * @throws {ValidationError} If the token is invalid or expired.
     * @throws {NotFoundError} If the owning user no longer exists.
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
     * Begins the account deletion flow by marking the user as pending deletion
     * with a 30-day grace period. Creates an audit record and sends a
     * confirmation email.
     *
     * @param userId - Database ID of the user requesting deletion.
     * @param password - Current password for identity verification (local auth only).
     * @param reason - Optional user-provided reason for leaving.
     * @param ipAddress - Request IP address for the audit trail.
     * @param userAgent - Request user agent for the audit trail.
     * @returns The scheduled deletion date and remaining grace period days.
     * @throws {NotFoundError} If the user does not exist.
     * @throws {ConflictError} If deletion is already pending.
     * @throws {AuthErrorForbidden} If the password is invalid (local auth).
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

        if (user.status === Status.PendingDeletion) {
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

            const matches = await verifyPassword(
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

        const proofHash = createHash('sha256')
            .update(`${userId}-${scheduledFor.toISOString()}`)
            .digest('hex');

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
            const locale = RequestContext.getUserLocale() ?? DEFAULT_LOCALE;

            await mailService.sendAccountDeletionConfirmation(
                user.email,
                user.username,
                scheduledFor.toLocaleDateString(locale)
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
     * Cancels a pending account deletion within the grace period.
     * Restores the user to active status, marks the audit record as
     * cancelled, and sends a confirmation email.
     *
     * @param userId - Database ID of the user cancelling deletion.
     * @throws {NotFoundError} If the user does not exist.
     * @throws {ValidationError} If the user is not pending deletion or the grace period has expired.
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

        if (user.status !== Status.PendingDeletion) {
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

        await db.user.cancelDeletion(userId);

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
     * Processes all users whose deletion grace period has expired by
     * performing a hard delete and sending a final notification email.
     * Intended to be invoked by a scheduled cron job.
     *
     * @returns Count of successfully processed and failed deletions.
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
