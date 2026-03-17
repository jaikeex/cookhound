import type { AdminDashboardStatsDTO } from '@/common/types';
import db from '@/server/db/model';
import { Logger, LogServiceMethod } from '@/server/logger';
import { assertAdmin } from '@/server/utils/reqwest';

//|=============================================================================================|//

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const log = Logger.getInstance('admin-service');

//§—————————————————————————————————————————————————————————————————————————————————————————————§//
//§                                         AUTH CHECKS                                         §//
///
//# All methods here should start with an explicit admin check.
//# While not necessary when called through the admin routes as they should already take
//# care of it, nothing prevents these methods from beaing called explicitly from other services
//# or elsewhere, in which case some operations might end up accessible to un-initiated users.
///
//§—————————————————————————————————————————————————————————————————————————————————————————————§//

/**
 * Service class for admin operations.
 */
class AdminService {
    @LogServiceMethod()
    async getDashboardStats(): Promise<AdminDashboardStatsDTO> {
        assertAdmin();

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [
            totalUsers,
            totalRecipes,
            openFlags,
            newUsersLast30Days,
            newRecipesLast30Days,
            totalRatings,
            recentRecipes,
            recentUsers
        ] = await Promise.all([
            db.admin.getActiveUserCount(),
            db.admin.getRecipeCount(),
            db.admin.getOpenFlagCount(),
            db.admin.getUserCountSince(thirtyDaysAgo),
            db.admin.getRecipeCountSince(thirtyDaysAgo),
            db.admin.getRatingCount(),
            db.admin.getRecentRecipes(5),
            db.admin.getRecentUsers(5)
        ]);

        const counts = {
            totalUsers,
            totalRecipes,
            openFlags,
            newUsersLast30Days,
            newRecipesLast30Days,
            totalRatings
        };

        const recentRecipesDto = recentRecipes.map((r) => ({
            id: r.id,
            displayId: r.displayId,
            title: r.title,
            authorUsername: r.author.username,
            language: r.language,
            createdAt: r.createdAt.toISOString()
        }));

        const recentUsersDto = recentUsers.map((u) => ({
            id: u.id,
            username: u.username,
            email: u.email,
            authType: u.authType,
            createdAt: u.createdAt.toISOString()
        }));

        return {
            counts,
            recentRecipes: recentRecipesDto,
            recentUsers: recentUsersDto
        };
    }
}

export const adminService = new AdminService();
