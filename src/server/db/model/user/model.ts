import {
    CACHE_TTL,
    cachePrismaQuery,
    generateCacheKey,
    invalidateModelCache
} from '@/server/db/model/model-cache';
import { ServerError } from '@/server/error';
import { ApplicationErrorCode } from '@/server/error/codes';
import { prisma } from '@/server/integrations';
import { Logger } from '@/server/logger';
import type {
    CookieConsent,
    Prisma,
    User,
    UserPreference
} from '@prisma/client';
import {
    getUserLastViewedRecipes,
    upsertUserPreference
} from '@prisma/client/sql';

//|=============================================================================================|//

const log = Logger.getInstance('user-model');

class UserModel {
    //~=========================================================================================~//
    //$                                          QUERIES                                        $//
    //~=========================================================================================~//

    /**
     * Cached user lookup by email
     * Query class -> C2
     */
    async getOneByEmail(
        email: string,
        select: Prisma.UserSelect,
        ttl?: number
    ): Promise<User | null> {
        const cacheKey = generateCacheKey('user', 'findUnique', {
            where: { email }
        });

        log.trace('Getting user by email', { email });

        const user = await cachePrismaQuery(
            cacheKey,
            async () => {
                log.trace('Fetching user from db by email', { email });
                return prisma.user.findUnique({ where: { email }, select });
            },
            ttl ?? CACHE_TTL.TTL_2
        );

        return this.reviveUserDates(user as User | null);
    }

    /**
     * Cached user lookup by ID
     * Query class -> C2
     */
    async getOneById(
        id: number,
        select: Prisma.UserSelect,
        ttl?: number
    ): Promise<User | null> {
        const cacheKey = generateCacheKey('user', 'findUnique', {
            where: { id }
        });

        log.trace('Getting user by id', { id });

        const user = await cachePrismaQuery(
            cacheKey,
            async () => {
                log.trace('Fetching user from db by id', { id });

                return prisma.user.findUnique({ where: { id }, select });
            },
            ttl ?? CACHE_TTL.TTL_2
        );

        return this.reviveUserDates(user as User | null);
    }

    /**
     * Cached user lookup by username
     * Query class -> C2
     */
    async getOneByUsername(
        username: string,
        ttl?: number
    ): Promise<User | null> {
        const cacheKey = generateCacheKey('user', 'findUnique', {
            where: { username }
        });

        log.trace('Getting user by username', { username });

        const user = await cachePrismaQuery(
            cacheKey,
            async () => {
                log.trace('Fetching user from db by username', { username });

                return prisma.user.findUnique({ where: { username } });
            },
            ttl ?? CACHE_TTL.TTL_2
        );

        return this.reviveUserDates(user);
    }

    /**
     * Cached user lookup with OR condition (email or username)
     * Query class -> C2
     */
    async getOneByEmailOrUsername(
        email: string,
        username: string,
        ttl?: number
    ): Promise<User | null> {
        const cacheKey = generateCacheKey('user', 'findFirst', {
            where: { OR: [{ email }, { username }] }
        });

        log.trace('Getting user by email or username', { email, username });

        const user = await cachePrismaQuery(
            cacheKey,
            async () => {
                log.trace('Fetching user from db by email or username', {
                    email,
                    username
                });

                return prisma.user.findFirst({
                    where: { OR: [{ email }, { username }] }
                });
            },
            ttl ?? CACHE_TTL.TTL_2
        );

        return this.reviveUserDates(user);
    }

    /**
     * Get user's last viewed recipes
     * Query class -> C3
     */
    async getLastViewedRecipes(
        userId: number,
        limit: number = 10
    ): Promise<getUserLastViewedRecipes.Result[]> {
        log.trace("Getting user's last viewed recipes", { userId });

        const recipes = await prisma.$queryRawTyped(
            getUserLastViewedRecipes(userId, limit)
        );

        return recipes;
    }

    /**
     * Cached user lookup by verification token
     * Query class -> C1
     */
    async getOneByEmailVerificationToken(
        token: string,
        ttl?: number
    ): Promise<User | null> {
        const cacheKey = generateCacheKey('user', 'findFirst', {
            where: { emailVerificationToken: token }
        });

        log.trace('Getting user by email verification token');

        const user = await cachePrismaQuery(
            cacheKey,
            async () => {
                log.trace('Fetching user from db by email verification token');

                return prisma.user.findFirst({
                    where: { emailVerificationToken: token }
                });
            },
            ttl ?? CACHE_TTL.TTL_1
        );

        return this.reviveUserDates(user);
    }

    /**
     * Cached user lookup by password reset token
     * Query class -> C1
     */
    async getOneByPasswordResetToken(
        token: string,
        ttl?: number
    ): Promise<User | null> {
        const cacheKey = generateCacheKey('user', 'findFirst', {
            where: { passwordResetToken: token }
        });

        log.trace('Getting user by password reset token');

        const user = await cachePrismaQuery(
            cacheKey,
            async () => {
                log.trace('Fetching user from db by password reset token');

                return prisma.user.findFirst({
                    where: { passwordResetToken: token }
                });
            },
            ttl ?? CACHE_TTL.TTL_1
        );

        return this.reviveUserDates(user);
    }

    /**
     * Get the latest user cookie consent
     * Query class -> C3
     */
    async getLatestUserCookieConsent(
        userId: number
    ): Promise<CookieConsent | null> {
        log.trace('Getting latest user cookie consent', { userId });

        const consent = await prisma.cookieConsent.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        return consent;
    }

    //~=========================================================================================~//
    //$                                         MUTATIONS                                       $//
    //~=========================================================================================~//

    /**
     * Create a new user
     * Write class -> W3
     */
    async createOne(data: Prisma.UserCreateInput): Promise<User> {
        log.trace('Creating user', {
            email: data.email,
            username: data.username
        });

        const user = await prisma.user.create({ data });

        return user;
    }

    /**
     * Create a new user consent
     * Write class -> W3
     */
    async createUserCookieConsent(
        userId: number,
        data: Omit<Prisma.CookieConsentCreateInput, 'user'>
    ): Promise<CookieConsent> {
        log.trace('Creating user consent', { data });

        const consent = await prisma.cookieConsent.create({
            data: { ...data, userId }
        });

        await this.invalidateUserCache({ id: userId });

        return consent;
    }

    /**
     * Revoke a user's cookie consent
     * Write class -> W3
     */
    async revokeUserCookieConsent(
        id: number,
        userId: number
    ): Promise<CookieConsent> {
        log.trace('Updating user consent', { id, userId });

        const consent = await prisma.cookieConsent.update({
            where: { id, userId },
            data: { revokedAt: new Date() }
        });

        await this.invalidateUserCache({ id: userId });

        return consent;
    }

    /**
     * Update a user by id
     * Write class -> W1
     */
    async updateOneById(
        id: number,
        data: Prisma.UserUpdateInput
    ): Promise<User | null> {
        log.trace('Updating user by id', { id });

        const user = await prisma.user.update({
            where: { id },
            data
        });

        await this.invalidateUserCache(user);

        return this.reviveUserDates(user);
    }

    /**
     * Register a user visit
     * Write class -> W3
     */
    async registerUserVisit(userId: number): Promise<void> {
        log.trace('Registering user visit', { userId });

        await prisma.user.update({
            where: { id: userId },
            data: { lastVisitedAt: new Date() }
        });
    }

    /**
     * Adds a recipe to the user's last viewed recipes
     * Write class -> W2
     */
    async addRecipeToLastViewed(
        userId: number,
        recipeId: number
    ): Promise<void> {
        log.trace("Adding recipe to user's last viewed recipes", {
            userId,
            recipeId
        });

        const MAX_VIEWED_RECIPES = 10;

        await prisma.$transaction(async (tx) => {
            // First, upsert the current recipe visit
            await tx.userVisitedRecipe.upsert({
                where: {
                    unique_user_recipe_visit: {
                        userId,
                        recipeId
                    }
                },
                update: {
                    visitedAt: new Date()
                },
                create: {
                    userId,
                    recipeId,
                    visitedAt: new Date()
                }
            });

            const totalVisited = await tx.userVisitedRecipe.count({
                where: { userId }
            });

            if (totalVisited > MAX_VIEWED_RECIPES) {
                const recipesToRemove = await tx.userVisitedRecipe.findMany({
                    where: { userId },
                    orderBy: { visitedAt: 'asc' },
                    take: totalVisited - MAX_VIEWED_RECIPES,
                    select: { userId: true, recipeId: true }
                });

                if (recipesToRemove.length > 0) {
                    await tx.userVisitedRecipe.deleteMany({
                        where: {
                            userId,
                            recipeId: {
                                in: recipesToRemove.map((r) => r.recipeId)
                            }
                        }
                    });
                }
            }
        });
    }

    /**
     * Merge user preferences
     * Write class -> W3
     */
    async upsertUserPreference(
        userId: number,
        settings: Prisma.InputJsonValue
    ): Promise<UserPreference> {
        log.trace('Merging user preferences', { userId, settings });

        const jsonSettings = (settings ?? {}) as Prisma.InputJsonObject;

        //? Note: `prisma.$queryRawTyped` is used because the jsonb concat (||)
        //? operator is not yet available in the prisma client api.
        await prisma.$queryRawTyped(upsertUserPreference(userId, jsonSettings));

        // Fetch the latest preference so callers receive the fully-merged value
        const preference = await prisma.userPreference.findUnique({
            where: { userId }
        });

        await this.invalidateUserCache({ id: userId });

        if (!preference) {
            log.warn('Failed to upsert user preference', { userId });

            throw new ServerError(
                'app.error.infrastructure',
                500,
                ApplicationErrorCode.DEFAULT,
                { userId }
            );
        }

        return preference;
    }

    //~=========================================================================================~//
    //$                                      PRIVATE METHODS                                    $//
    //~=========================================================================================~//

    /**
     * Invalidate all cache entries for a specific user using pattern-based invalidation
     * This automatically handles all current and future cache keys without manual maintenance
     */
    private async invalidateUserCache(
        changed: Partial<User>,
        original?: Partial<User>
    ) {
        await invalidateModelCache('user', changed, original ?? undefined);
    }

    private reviveUserDates(user: User | null) {
        if (!user) return user;

        return {
            ...user,
            createdAt: user.createdAt
                ? new Date(user.createdAt)
                : user.createdAt,
            lastLogin: user.lastLogin
                ? new Date(user.lastLogin)
                : user.lastLogin,
            lastVisitedAt: user.lastVisitedAt
                ? new Date(user.lastVisitedAt)
                : user.lastVisitedAt,
            lastPasswordReset: user.lastPasswordReset
                ? new Date(user.lastPasswordReset)
                : user.lastPasswordReset,
            passwordResetTokenExpires: user.passwordResetTokenExpires
                ? new Date(user.passwordResetTokenExpires)
                : user.passwordResetTokenExpires,
            updatedAt: user.updatedAt
                ? new Date(user.updatedAt)
                : user.updatedAt
        };
    }
}

const userModel = new UserModel();
export default userModel;
