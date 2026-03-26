import type { Prisma } from '@/server/db/generated/prisma/client';
import { prisma } from '@/server/integrations';
import { Logger } from '@/server/logger';

const log = Logger.getInstance('admin-model');

//~=============================================================================================~//
//$                                            TYPES                                            $//
//~=============================================================================================~//

type GetUsersOptions = {
    page: number;
    pageSize: number;
    search?: string;
    role?: string;
    status?: string;
    authType?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
};

//~=============================================================================================~//
//$                                            MODEL                                            $//
//~=============================================================================================~//

class AdminModel {
    //?—————————————————————————————————————————————————————————————————————————————————————————?//
    //?                                     NO CACHING HERE                                     ?//
    ///
    //# None of these queries are cached on purpose.
    //# The administration should always show up to date data, and is not accessed ofteh enough.
    ///
    //?—————————————————————————————————————————————————————————————————————————————————————————?//

    //~=========================================================================================~//
    //$                                   DASHBOARD QUERIES                                     $//
    //~=========================================================================================~//

    async getActiveUserCount(): Promise<number> {
        log.trace('Getting active user count');

        return prisma.user.count({ where: { status: 'active' } });
    }

    async getRecipeCount(): Promise<number> {
        log.trace('Getting recipe count');

        return prisma.recipe.count();
    }

    async getOpenFlagCount(): Promise<number> {
        log.trace('Getting open flag count');

        return prisma.recipeFlag.count({
            where: { active: true, resolved: false }
        });
    }

    async getUserCountSince(since: Date): Promise<number> {
        log.trace('Getting user count since', { since });

        return prisma.user.count({
            where: { createdAt: { gte: since }, status: 'active' }
        });
    }

    async getRecipeCountSince(since: Date): Promise<number> {
        log.trace('Getting recipe count since', { since });

        return prisma.recipe.count({
            where: { createdAt: { gte: since } }
        });
    }

    async getRatingCount(): Promise<number> {
        log.trace('Getting rating count');

        return prisma.rating.count();
    }

    async getRecentRecipes(limit = 5) {
        log.trace('Getting recent recipes', { limit });

        return prisma.recipe.findMany({
            select: {
                id: true,
                displayId: true,
                title: true,
                language: true,
                createdAt: true,
                author: { select: { username: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: limit
        });
    }

    async getRecentUsers(limit = 5) {
        log.trace('Getting recent users', { limit });

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

    //~=========================================================================================~//
    //$                                    USER MANAGEMENT                                      $//
    //~=========================================================================================~//

    async getUsers(options: GetUsersOptions) {
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
                select: {
                    id: true,
                    username: true,
                    email: true,
                    authType: true,
                    role: true,
                    status: true,
                    emailVerified: true,
                    avatarUrl: true,
                    createdAt: true,
                    lastLogin: true,
                    lastVisitedAt: true,
                    _count: { select: { recipes: true } }
                },
                where,
                orderBy,
                skip: (page - 1) * pageSize,
                take: pageSize
            }),
            prisma.user.count({ where })
        ]);

        return { users, total };
    }

    async getUserById(userId: number) {
        log.trace('Getting user by id', { userId });

        return prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
                authType: true,
                role: true,
                status: true,
                emailVerified: true,
                avatarUrl: true,
                createdAt: true,
                updatedAt: true,
                lastLogin: true,
                lastVisitedAt: true,
                lastPasswordReset: true,
                deletedAt: true,
                deletionScheduledFor: true,
                _count: {
                    select: {
                        recipes: true,
                        ratings: true,
                        flags: true
                    }
                }
            }
        });
    }

    async updateUserById(userId: number, data: Prisma.UserUpdateInput) {
        log.trace('Updating user by id', { userId });

        return prisma.user.update({
            where: { id: userId },
            data
        });
    }
}

const adminModel = new AdminModel();
export default adminModel;
