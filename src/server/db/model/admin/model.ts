import { prisma } from '@/server/integrations';
import { Logger } from '@/server/logger';

const log = Logger.getInstance('admin-model');

class AdminModel {
    //~=========================================================================================~//
    //$                                          QUERIES                                        $//
    //~=========================================================================================~//

    //?—————————————————————————————————————————————————————————————————————————————————————————?//
    //?                                     NO CACHING HERE                                     ?//
    ///
    //# None of these queries are cached on purpose.
    //# The administration should always show up to date data, and is not accessed ofteh enough.
    ///
    //?—————————————————————————————————————————————————————————————————————————————————————————?//

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
}

const adminModel = new AdminModel();
export default adminModel;
