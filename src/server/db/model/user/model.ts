import {
    CACHE_TAGS,
    CACHE_TTL,
    cachePrismaQuery,
    generateCacheKey,
    invalidateTags
} from '@/server/db/model/model-cache';
import { ServerError } from '@/server/error';
import { ApplicationErrorCode } from '@/server/error/codes';
import { prisma } from '@/server/integrations';
import { Logger } from '@/server/logger';
import type {
    CookieConsent,
    Prisma,
    TermsAcceptance,
    User,
    UserPreference,
    EmailChangeRequest
} from '@/server/db/generated/prisma/client';
import {
    getUserLastViewedRecipes,
    upsertUserPreference
} from '@/server/db/generated/prisma/sql';
import { ANONYMOUS_USER_ID } from '@/common/constants';
import { ADMIN_USER_LIST_SELECT } from './projections';

//|=============================================================================================|//

const log = Logger.getInstance('user-model');

//~=============================================================================================~//
//$                                            TYPES                                            $//
//~=============================================================================================~//

export type GetUsersOptions = {
    page: number;
    pageSize: number;
    search?: string;
    role?: string;
    status?: string;
    authType?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
};

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
            where: { email },
            select
        });

        log.trace('Getting user by email', { email });

        const user = await cachePrismaQuery(
            cacheKey,
            async () => {
                log.trace('Fetching user from db by email', { email });
                return prisma.user.findUnique({ where: { email }, select });
            },
            (result) => this.lookupTtl(ttl ?? CACHE_TTL.TTL_2, result),
            (result) => this.userTagsFor(result)
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
            where: { id },
            select
        });

        log.trace('Getting user by id', { id });

        const user = await cachePrismaQuery(
            cacheKey,
            async () => {
                log.trace('Fetching user from db by id', { id });

                return prisma.user.findUnique({ where: { id }, select });
            },
            (result) => this.lookupTtl(ttl ?? CACHE_TTL.TTL_2, result),
            [CACHE_TAGS.user.entity(id)]
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
            (result) => this.lookupTtl(ttl ?? CACHE_TTL.TTL_2, result),
            (result) => this.userTagsFor(result)
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
            (result) => this.lookupTtl(ttl ?? CACHE_TTL.TTL_2, result),
            (result) => this.userTagsFor(result)
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
            ttl ?? CACHE_TTL.TTL_1,
            (result) => this.userTagsFor(result)
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
            ttl ?? CACHE_TTL.TTL_1,
            (result) => this.userTagsFor(result)
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

    /**
     * Get the latest user terms acceptance
     * Query class -> C3
     */
    async getLatestUserTermsAcceptance(
        userId: number
    ): Promise<TermsAcceptance | null> {
        log.trace('Getting latest user terms acceptance', { userId });

        const termsAcceptance = await prisma.termsAcceptance.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        return termsAcceptance;
    }

    //~=========================================================================================~//
    //$                                  ADMIN-FACING AGGREGATES                                $//
    ///
    //# These read methods are intentionally uncached. They feed admin dashboards and user
    //# management screens that must always reflect live state.
    //~=========================================================================================~//

    /**
     * Count active users.
     * Query class -> C3
     */
    async countActive(): Promise<number> {
        log.trace('Counting active users');

        return prisma.user.count({ where: { status: 'active' } });
    }

    /**
     * Count active users created on or after the given timestamp.
     * Query class -> C3
     */
    async countCreatedSince(since: Date): Promise<number> {
        log.trace('Counting users created since', { since });

        return prisma.user.count({
            where: { createdAt: { gte: since }, status: 'active' }
        });
    }

    /**
     * Return the most recently created active users, newest first.
     * Query class -> C3
     */
    async getRecentActive(limit = 5) {
        log.trace('Getting recent active users', { limit });

        return prisma.user.findMany({
            select: {
                id: true,
                username: true,
                email: true,
                authType: true,
                createdAt: true
            },
            where: { status: 'active' },
            orderBy: { createdAt: 'desc' },
            take: limit
        });
    }

    /**
     * Return a paginated, filtered, sorted list of users.
     * Query class -> C3
     */
    async getMany(options: GetUsersOptions) {
        const {
            page,
            pageSize,
            search,
            role,
            status,
            authType,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = options;

        log.trace('Getting users', {
            page,
            pageSize,
            search,
            role,
            status,
            authType
        });

        const where: Prisma.UserWhereInput = {};

        if (search) {
            where.OR = [
                { username: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
            ];
        }

        if (role) {
            where.role = role;
        }

        if (status) {
            where.status = status;
        }

        if (authType) {
            where.authType = authType;
        }

        const orderBy: Prisma.UserOrderByWithRelationInput = {
            [sortBy]: sortOrder
        };

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                select: ADMIN_USER_LIST_SELECT,
                where,
                orderBy,
                skip: (page - 1) * pageSize,
                take: pageSize
            }),
            prisma.user.count({ where })
        ]);

        return { users, total };
    }

    //~=========================================================================================~//
    //$                               EMAIL CHANGE REQUEST METHODS                              $//
    //~=========================================================================================~//

    /**
     * Upsert (create or replace) an email change request for a user.
     * Ensures there is at most one active request per user by using the unique
     * constraint on `userId`. Any previous request for the same user will be
     * overwritten.
     * Write class -> W1
     */
    async upsertEmailChangeRequest(
        userId: number,
        newEmail: string,
        token: string,
        expiresAt: Date
    ): Promise<EmailChangeRequest> {
        log.trace('Upserting email change request', {
            userId,
            newEmail,
            token,
            expiresAt
        });

        // Capture the token being replaced so its cached lookup entry can be dropped too.
        const previous = await prisma.emailChangeRequest.findUnique({
            where: { userId },
            select: { token: true }
        });

        const request = await prisma.emailChangeRequest.upsert({
            where: { userId },
            update: {
                newEmail,
                token,
                expiresAt
            },
            create: {
                userId,
                newEmail,
                token,
                expiresAt
            }
        });

        // No user fields change yet, but still invalidate cache in case callers
        // read user relations that depend on email change requests.
        await this.invalidateUserCache({ id: userId });

        await invalidateTags([
            CACHE_TAGS.emailChangeRequest.byToken(token),
            ...(previous && previous.token !== token
                ? [CACHE_TAGS.emailChangeRequest.byToken(previous.token)]
                : [])
        ]);

        return request;
    }

    /**
     * Fetch an email change request by its verification token.
     * Query class -> C1
     */
    async getEmailChangeRequestByToken(
        token: string,
        ttl?: number
    ): Promise<EmailChangeRequest | null> {
        const cacheKey = generateCacheKey('emailChangeRequest', 'findUnique', {
            where: { token }
        });

        log.trace('Getting email change request by token');

        const request = await cachePrismaQuery(
            cacheKey,
            async () => {
                log.trace('Fetching email change request from db by token');
                return prisma.emailChangeRequest.findUnique({
                    where: { token }
                });
            },
            ttl ?? CACHE_TTL.TTL_1,
            [CACHE_TAGS.emailChangeRequest.byToken(token)]
        );

        if (!request) return null;

        return {
            ...request,
            expiresAt: new Date(request.expiresAt),
            createdAt: new Date(request.createdAt)
        };
    }

    /**
     * Delete (consume) an email change request by token once it is confirmed or expired.
     * Write class -> W1
     */
    async deleteEmailChangeRequestByToken(
        token: string
    ): Promise<EmailChangeRequest | null> {
        log.trace('Deleting email change request by token');

        try {
            const deleted = await prisma.emailChangeRequest.delete({
                where: { token }
            });

            await this.invalidateUserCache({ id: deleted.userId });
            await invalidateTags([
                CACHE_TAGS.emailChangeRequest.byToken(token)
            ]);

            return deleted;
        } catch (error: unknown) {
            // Swallow not-found errors to keep idempotency for callers.
            if (
                error instanceof ServerError &&
                error.code === ApplicationErrorCode.DEFAULT
            ) {
                return null;
            }
            throw error;
        }
    }

    /**
     * Apply an email change for a user and consume the corresponding email change request token.
     * Performs the operation atomically within a single transaction.
     * Write class -> W2
     */
    async applyEmailChange(
        userId: number,
        newEmail: string,
        token: string
    ): Promise<void> {
        log.trace('Applying email change', { userId, newEmail, token });

        await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: userId },
                data: {
                    email: newEmail,
                    emailVerified: true
                }
            });
            await tx.emailChangeRequest.delete({ where: { token } });
        });

        // Invalidate cache for the affected user so subsequent reads get fresh data
        await this.invalidateUserCache({ id: userId });
        await invalidateTags([CACHE_TAGS.emailChangeRequest.byToken(token)]);
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

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        const consent = await prisma.cookieConsent.create({
            data: { ...data, userId }
        });

        await this.invalidateUserCache({ ...user });

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
     * Create a new user terms acceptance record
     * Write class -> W3
     */
    async createUserTermsAcceptance(
        userId: number,
        data: Omit<Prisma.TermsAcceptanceCreateInput, 'user'>
    ): Promise<TermsAcceptance> {
        log.trace('Creating user terms acceptance', { data });

        const termsAcceptance = await prisma.termsAcceptance.create({
            data: { ...data, userId }
        });

        await this.invalidateUserCache({ id: userId });

        return termsAcceptance;
    }

    /**
     * Revoke a user's terms acceptance
     * Write class -> W3
     */
    async revokeUserTermsAcceptance(
        id: number,
        userId: number
    ): Promise<TermsAcceptance> {
        log.trace('Revoking user terms acceptance', { id, userId });

        const termsAcceptance = await prisma.termsAcceptance.update({
            where: { id, userId },
            data: { revokedAt: new Date() }
        });

        await this.invalidateUserCache({ id: userId });

        return termsAcceptance;
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
                                in: recipesToRemove.map(
                                    (r: { recipeId: number }) => r.recipeId
                                )
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
    //$                                  ACCOUNT DELETION METHODS                               $//
    //~=========================================================================================~//

    /**
     * Marks user for deletion
     * Write class -> W2
     */
    async markForDeletion(
        userId: number,
        scheduledFor: Date
    ): Promise<User | null> {
        log.trace('Marking user for deletion', { userId, scheduledFor });

        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                status: 'pending_deletion',
                deletedAt: new Date(),
                deletionScheduledFor: scheduledFor
            }
        });

        await this.invalidateUserCache(user);

        return this.reviveUserDates(user);
    }

    /**
     * Cancel deletion
     * Write class -> W2
     */
    async cancelDeletion(userId: number): Promise<User | null> {
        log.trace('Cancelling user deletion', { userId });

        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                status: 'active',
                deletedAt: null,
                deletionScheduledFor: null
            }
        });

        await this.invalidateUserCache(user);

        return this.reviveUserDates(user);
    }

    /**
     * Get users pending hard deletion (past the grace period)
     * Query class -> C3
     */
    async getUsersPendingHardDeletion(): Promise<User[]> {
        log.trace('Getting users pending hard deletion');

        const users = await prisma.user.findMany({
            where: {
                status: 'pending_deletion',
                deletionScheduledFor: {
                    lte: new Date()
                }
            }
        });

        return users.map((user) => this.reviveUserDates(user) as User);
    }

    /**
     * Anonymize user's recipes by changing authorId to -1
     * Write class -> W1
     */
    async anonymizeUserRecipes(userId: number): Promise<void> {
        log.trace('Anonymizing user recipes', { userId });

        const recipes = await prisma.recipe.findMany({
            where: { authorId: userId },
            select: { id: true, displayId: true }
        });

        await prisma.recipe.updateMany({
            where: { authorId: userId },
            data: { authorId: ANONYMOUS_USER_ID }
        });

        await invalidateTags(this.reparentedRecipeTags(userId, recipes));

        return;
    }

    /**
     * Anonymize user's cookbooks by changing ownerId to -1
     * Write class -> W1
     */
    async anonymizeUserCookbooks(userId: number): Promise<void> {
        log.trace('Anonymizing user cookbooks', { userId });

        const cookbooks = await prisma.cookbook.findMany({
            where: { ownerId: userId },
            select: { id: true }
        });

        await prisma.cookbook.updateMany({
            where: { ownerId: userId },
            data: { ownerId: ANONYMOUS_USER_ID }
        });

        await invalidateTags(this.reparentedCookbookTags(userId, cookbooks));

        return;
    }

    /**
     * Hard delete user
     * Write class -> W1
     */
    async hardDeleteUser(userId: number): Promise<void> {
        log.trace('Hard deleting user', { userId });

        await prisma.user.delete({
            where: { id: userId }
        });

        await this.invalidateUserCache({ id: userId });

        return;
    }

    /**
     * Execute complete hard deletion of a user and all related data
     * This includes anonymizing content, deleting personal data, and removing the user record
     * Write class -> W1
     */
    async executeHardDeletion(userId: number): Promise<void> {
        log.trace('Executing hard deletion for user', { userId });

        const [recipes, cookbooks] = await Promise.all([
            prisma.recipe.findMany({
                where: { authorId: userId },
                select: { id: true, displayId: true }
            }),
            prisma.cookbook.findMany({
                where: { ownerId: userId },
                select: { id: true }
            })
        ]);

        await prisma.$transaction(async (tx) => {
            // Mark audit record as completed before deletion
            const auditRecord = await tx.accountDeletionRequest.findFirst({
                where: { userId },
                orderBy: { requestedAt: 'desc' }
            });

            if (auditRecord) {
                await tx.accountDeletionRequest.update({
                    where: { id: auditRecord.id },
                    data: { completedAt: new Date() }
                });
            }

            // Anonymize recipes (reparent to the system user)
            await tx.recipe.updateMany({
                where: { authorId: userId },
                data: { authorId: ANONYMOUS_USER_ID }
            });

            // Anonymize cookbooks (reparent to the system user)
            await tx.cookbook.updateMany({
                where: { ownerId: userId },
                data: { ownerId: ANONYMOUS_USER_ID }
            });

            await tx.shoppingListIngredient.deleteMany({
                where: { userId }
            });

            await tx.rating.deleteMany({
                where: { userId }
            });

            // Appeals reference recipeFlag (RESTRICT) and the user row itself
            // (RESTRICT for the author FK), so they must be cleared before the
            // flag rows and before the user is removed.
            await tx.recipeFlagAppeal.deleteMany({
                where: {
                    OR: [{ userId }, { flag: { userId } }]
                }
            });

            await tx.recipeFlag.deleteMany({
                where: { userId }
            });

            await tx.userVisitedRecipe.deleteMany({
                where: { userId }
            });

            await tx.userPreference.deleteMany({
                where: { userId }
            });

            await tx.cookieConsent.deleteMany({
                where: { userId }
            });

            await tx.termsAcceptance.deleteMany({
                where: { userId }
            });

            await tx.emailChangeRequest.deleteMany({
                where: { userId }
            });

            await tx.cookbookBookmark.deleteMany({
                where: { userId }
            });

            await tx.accountDeletionRequest.deleteMany({
                where: { userId }
            });

            await tx.contentReport.updateMany({
                where: { reporterId: userId },
                data: { reporterId: ANONYMOUS_USER_ID }
            });

            await tx.user.delete({
                where: { id: userId }
            });
        });

        await this.invalidateUserCache({ id: userId });

        await invalidateTags([
            ...this.reparentedRecipeTags(userId, recipes),
            ...this.reparentedCookbookTags(userId, cookbooks)
        ]);

        return;
    }

    //~=========================================================================================~//
    //$                                      PRIVATE METHODS                                    $//
    //~=========================================================================================~//

    /**
     * Build the tag list for a cached user lookup result. Every user entry,
     * regardless of whether it was fetched by email, username, token etc
     * is tagged with the user id, so a single invalidation clears all of them.
     *
     * Every user projection includes id, so a non-null result always returns
     * a tag; a null not-found result returns none.
     */
    private userTagsFor(result: unknown): readonly string[] {
        const id = (result as { id?: number } | null)?.id;
        return typeof id === 'number' ? [CACHE_TAGS.user.entity(id)] : [];
    }

    /**
     * Resolve the ttl for a lookup keyed by a caller-supplied value.
     *
     * A hit keeps the C2 tier; a miss is not cached at all (ttl 0). A cached
     * null could never be served anyway — redisClient.get maps a stored null
     * back to "key absent", so cachePrismaQuery always treats it as a miss.
     * Caching it would only pin a value key plus a tag set per probed value,
     * which matters because these reads are reachable by anyone hitting the
     * login, availability or profile endpoints.
     */
    private lookupTtl(hitTtl: number, result: unknown): number {
        return result === null ? 0 : hitTtl;
    }

    /**
     * Tags to drop after reparenting a user's recipes to the anonymous user:
     * both single-recipe lookups per recipe plus the author's collections.
     */
    private reparentedRecipeTags(
        userId: number,
        recipes: ReadonlyArray<{ id: number; displayId: string }>
    ): readonly string[] {
        return [
            CACHE_TAGS.recipe.ownedBy(userId),
            ...recipes.flatMap((recipe) => [
                CACHE_TAGS.recipe.entity(recipe.id),
                CACHE_TAGS.recipe.byDisplayId(recipe.displayId)
            ])
        ];
    }

    /**
     * Tags to drop after reparenting a user's cookbooks to the anonymous user.
     */
    private reparentedCookbookTags(
        userId: number,
        cookbooks: ReadonlyArray<{ id: number }>
    ): readonly string[] {
        return [
            CACHE_TAGS.cookbook.ownedBy(userId),
            ...cookbooks.map((cookbook) =>
                CACHE_TAGS.cookbook.entity(cookbook.id)
            )
        ];
    }

    /**
     * Invalidate every cache entry for a specific user.
     */
    private async invalidateUserCache(
        changed: Partial<User>,
        original?: Partial<User>
    ) {
        const ids = new Set<number>();

        if (typeof changed.id === 'number') {
            ids.add(changed.id);
        }

        if (original && typeof original.id === 'number') {
            ids.add(original.id);
        }

        if (ids.size === 0) {
            return;
        }

        await invalidateTags(
            Array.from(ids, (id) => CACHE_TAGS.user.entity(id))
        );
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
            deletedAt: user.deletedAt
                ? new Date(user.deletedAt)
                : user.deletedAt,
            deletionScheduledFor: user.deletionScheduledFor
                ? new Date(user.deletionScheduledFor)
                : user.deletionScheduledFor,
            updatedAt: user.updatedAt
                ? new Date(user.updatedAt)
                : user.updatedAt
        };
    }
}

const userModel = new UserModel();
export default userModel;
