import {
    CACHE_TTL,
    cachePrismaQuery,
    generateCacheKey,
    invalidateModelCache
} from '@/server/db/model/model-cache';
import { prisma } from '@/server/integrations';
import { Logger } from '@/server/logger';
import type { Prisma, User } from '@prisma/client';
import { getUserLastViewedRecipes } from '@prisma/client/sql';

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
    async getOneByEmail(email: string, ttl?: number): Promise<User | null> {
        const cacheKey = generateCacheKey('user', 'findUnique', {
            where: { email }
        });

        log.trace('Getting user by email', { email });

        const user = await cachePrismaQuery(
            cacheKey,
            async () => {
                log.trace('Fetching user from db by email', { email });
                return prisma.user.findUnique({ where: { email } });
            },
            ttl ?? CACHE_TTL.TTL_2
        );

        return this.reviveUserDates(user);
    }

    /**
     * Cached user lookup by ID
     * Query class -> C2
     */
    async getOneById(id: number, ttl?: number): Promise<User | null> {
        const cacheKey = generateCacheKey('user', 'findUnique', {
            where: { id }
        });

        log.trace('Getting user by id', { id });

        const user = await cachePrismaQuery(
            cacheKey,
            async () => {
                log.trace('Fetching user from db by id', { id });

                return prisma.user.findUnique({ where: { id } });
            },
            ttl ?? CACHE_TTL.TTL_2
        );

        return this.reviveUserDates(user);
    }

    /**
     * Cached user lookup by ID with column projection
     * Query class -> C2
     */
    async getOneByIdWithSelect(
        id: number,
        select: Prisma.UserSelect,
        ttl?: number
    ): Promise<User | null> {
        const cacheKey = generateCacheKey('user', 'findUnique', {
            where: { id },
            select
        });

        log.trace('Getting user by id with select', { id, select });

        const user = await cachePrismaQuery(
            cacheKey,
            async () => {
                log.trace('Fetching user from db by id with select', {
                    id,
                    select
                });
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
