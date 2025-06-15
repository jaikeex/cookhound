import {
    cachePrismaQuery,
    generateCacheKey,
    invalidateModelCache
} from '@/server/db/model/model-cache';
import prisma from '@/server/db/prisma';
import type { Prisma, User } from '@prisma/client';

class UserModel {
    // ***************************************************************************************** //
    // ?                                         QUERIES                                       ? //
    // ***************************************************************************************** //

    /**
     * Cached user lookup by email
     * @param email - User email
     * @param ttl - Cache TTL in seconds (optional)
     */
    async getOneByEmail(email: string, ttl?: number): Promise<User | null> {
        const cacheKey = generateCacheKey('user', 'findUnique', {
            where: { email }
        });

        const user = await cachePrismaQuery(
            cacheKey,
            () => prisma.user.findUnique({ where: { email } }),
            ttl
        );

        return this.reviveUserDates(user);
    }

    /**
     * Cached user lookup by ID
     * @param id - User ID
     * @param ttl - Cache TTL in seconds (optional)
     */
    async getOneById(id: number, ttl?: number): Promise<User | null> {
        const cacheKey = generateCacheKey('user', 'findUnique', {
            where: { id }
        });

        const user = await cachePrismaQuery(
            cacheKey,
            () => prisma.user.findUnique({ where: { id } }),
            ttl
        );

        return this.reviveUserDates(user);
    }

    /**
     * Cached user lookup by username
     * @param username - Username
     * @param ttl - Cache TTL in seconds (optional)
     */
    async getOneByUsername(
        username: string,
        ttl?: number
    ): Promise<User | null> {
        const cacheKey = generateCacheKey('user', 'findUnique', {
            where: { username }
        });

        const user = await cachePrismaQuery(
            cacheKey,
            () => prisma.user.findUnique({ where: { username } }),
            ttl
        );

        return this.reviveUserDates(user);
    }

    /**
     * Cached user lookup with OR condition (email or username)
     * @param email - User email
     * @param username - Username
     * @param ttl - Cache TTL in seconds (optional)
     */
    async getOneByEmailOrUsername(
        email: string,
        username: string,
        ttl?: number
    ): Promise<User | null> {
        const cacheKey = generateCacheKey('user', 'findFirst', {
            where: { OR: [{ email }, { username }] }
        });

        const user = await cachePrismaQuery(
            cacheKey,
            () =>
                prisma.user.findFirst({
                    where: {
                        OR: [{ email }, { username }]
                    }
                }),
            ttl
        );

        return this.reviveUserDates(user);
    }

    /**
     * Cached user lookup by verification token
     * @param token - Email verification token
     * @param ttl - Cache TTL in seconds (optional)
     */
    async getOneByEmailVerificationToken(
        token: string,
        ttl?: number
    ): Promise<User | null> {
        const cacheKey = generateCacheKey('user', 'findFirst', {
            where: { emailVerificationToken: token }
        });

        const user = await cachePrismaQuery(
            cacheKey,
            () =>
                prisma.user.findFirst({
                    where: { emailVerificationToken: token }
                }),
            ttl
        );

        return this.reviveUserDates(user);
    }

    // ***************************************************************************************** //
    // ?                                        MUTATIONS                                      ? //
    // ***************************************************************************************** //

    async updateOneById(
        id: number,
        data: Prisma.UserUpdateInput
    ): Promise<User | null> {
        // Get original user data for precise cache invalidation
        const originalUser = await prisma.user.findUnique({ where: { id } });

        const user = await prisma.user.update({
            where: { id },
            data
        });

        await this.invalidateUserCache(user, originalUser);

        return this.reviveUserDates(user);
    }

    async createOne(data: Prisma.UserCreateInput): Promise<User> {
        const user = await prisma.user.create({ data });
        return user;
    }

    // ***************************************************************************************** //
    // ?                                     PRIVATE METHODS                                   ? //
    // ***************************************************************************************** //

    /**
     * Invalidate all cache entries for a specific user using pattern-based invalidation
     * This automatically handles all current and future cache keys without manual maintenance
     * @param user - User object with id, email, and username
     */
    private async invalidateUserCache(changed: User, original: User | null) {
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
            updatedAt: user.updatedAt
                ? new Date(user.updatedAt)
                : user.updatedAt
        };
    }
}

const userModel = new UserModel();
export default userModel;
