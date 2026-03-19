import type {
    AdminDashboardStatsDTO,
    AdminUserListDTO,
    AdminUserDetailDTO
} from '@/common/types';
import { AuthType, Status, UserRole } from '@/common/types';
import {
    AdminAction,
    DEFAULT_LOCALE,
    ONE_DAY_IN_MILLISECONDS
} from '@/common/constants';
import { v4 as uuid } from 'uuid';
import { createHash } from 'crypto';
import db from '@/server/db/model';
import { Logger, LogServiceMethod } from '@/server/logger';
import { assertAdmin, assertAdminAndNotSelf } from '@/server/utils/reqwest';
import { RequestContext } from '@/server/utils/reqwest/context';
import { sessions } from '@/server/utils/session';
import { mailService } from '@/server/services/mail/service';
import { NotFoundError, ValidationError } from '@/server/error';
import { ApplicationErrorCode } from '@/server/error/codes';

//|=============================================================================================|//

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

const ACCOUNT_DELETION_GRACE_PERIOD_DAYS = 30;

/**
 * Service class for admin operations.
 */
class AdminService {
    //~=========================================================================================~//
    //$                                       DASHBOARD                                         $//
    //~=========================================================================================~//

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

    //~=========================================================================================~//
    //$                                    USER MANAGEMENT                                      $//
    //~=========================================================================================~//

    @LogServiceMethod({ names: ['page', 'pageSize', 'search'] })
    async getUsers(options: {
        page: number;
        pageSize: number;
        search?: string;
        role?: string;
        status?: string;
        authType?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }): Promise<AdminUserListDTO> {
        assertAdmin();

        const { users, total } = await db.admin.getUsers(options);

        const usersDto = users.map((u) => ({
            id: u.id,
            username: u.username,
            email: u.email,
            authType: u.authType,
            role: u.role,
            status: u.status,
            emailVerified: u.emailVerified,
            avatarUrl: u.avatarUrl,
            createdAt: u.createdAt.toISOString(),
            lastLogin: u.lastLogin?.toISOString() ?? null,
            lastVisitedAt: u.lastVisitedAt?.toISOString() ?? null,
            recipeCount: u._count.recipes
        }));

        return {
            users: usersDto,
            totalItems: total,
            page: options.page,
            pageSize: options.pageSize
        };
    }

    @LogServiceMethod({ names: ['userId'] })
    async getUserById(userId: number): Promise<AdminUserDetailDTO> {
        assertAdmin();

        const user = await this.requireUser(userId);

        const userDto: AdminUserDetailDTO = {
            id: user.id,
            username: user.username,
            email: user.email,
            authType: user.authType,
            role: user.role,
            status: user.status,
            emailVerified: user.emailVerified,
            avatarUrl: user.avatarUrl,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
            lastLogin: user.lastLogin?.toISOString() ?? null,
            lastVisitedAt: user.lastVisitedAt?.toISOString() ?? null,
            lastPasswordReset: user.lastPasswordReset?.toISOString() ?? null,
            deletedAt: user.deletedAt?.toISOString() ?? null,
            deletionScheduledFor:
                user.deletionScheduledFor?.toISOString() ?? null,
            recipeCount: user._count.recipes,
            ratingCount: user._count.ratings,
            flagCount: user._count.flags
        };

        return userDto;
    }

    @LogServiceMethod({ names: ['targetUserId', 'newRole'] })
    async changeUserRole(
        targetUserId: number,
        newRole: UserRole
    ): Promise<void> {
        const adminUserId = assertAdminAndNotSelf(targetUserId);

        const user = await this.requireUser(targetUserId);

        if (newRole !== UserRole.User && newRole !== UserRole.Admin) {
            throw new ValidationError(
                'admin.users.error.invalid-role',
                ApplicationErrorCode.VALIDATION_FAILED
            );
        }

        const oldRole = user.role;

        await db.admin.updateUserById(targetUserId, { role: newRole });

        await this.logAction(
            adminUserId,
            targetUserId,
            AdminAction.ChangeRole,
            {
                oldRole,
                newRole
            }
        );
    }

    @LogServiceMethod({ names: ['targetUserId', 'newStatus'] })
    async changeUserStatus(
        targetUserId: number,
        newStatus: Status,
        reason?: string
    ): Promise<void> {
        const adminUserId = assertAdminAndNotSelf(targetUserId);

        const user = await this.requireUser(targetUserId);

        if (newStatus !== Status.Active && newStatus !== Status.Banned) {
            throw new ValidationError(
                'admin.users.error.invalid-status',
                ApplicationErrorCode.VALIDATION_FAILED
            );
        }

        if (user.status === Status.PendingDeletion) {
            throw new ValidationError(
                'admin.users.error.cannot-change-pending-deletion',
                ApplicationErrorCode.PRECONDITION_FAILED
            );
        }

        if (user.status === newStatus) {
            throw new ValidationError(
                'admin.users.error.status-unchanged',
                ApplicationErrorCode.VALIDATION_FAILED
            );
        }

        const oldStatus = user.status;

        // If banning, invalidate all sessions first
        if (newStatus === Status.Banned) {
            await sessions.invalidateAllUserSessions(targetUserId);
        }

        await db.admin.updateUserById(targetUserId, {
            status: newStatus
        });

        await this.logAction(
            adminUserId,
            targetUserId,
            newStatus === Status.Banned ? AdminAction.Ban : AdminAction.Unban,
            { oldStatus, newStatus, reason }
        );
    }

    @LogServiceMethod({ names: ['targetUserId'] })
    async forceLogout(targetUserId: number): Promise<void> {
        const adminUserId = assertAdminAndNotSelf(targetUserId);
        await this.requireUser(targetUserId);

        await sessions.invalidateAllUserSessions(targetUserId);

        await this.logAction(
            adminUserId,
            targetUserId,
            AdminAction.ForceLogout
        );
    }

    @LogServiceMethod({ names: ['targetUserId'] })
    async forcePasswordReset(targetUserId: number): Promise<void> {
        const adminUserId = assertAdminAndNotSelf(targetUserId);
        const user = await this.requireUser(targetUserId);

        if (user.authType === AuthType.Google) {
            throw new ValidationError(
                'admin.users.error.google-auth-no-password',
                ApplicationErrorCode.VALIDATION_FAILED
            );
        }

        const passwordResetToken = uuid();
        const passwordResetTokenExpires = new Date(
            Date.now() + ONE_DAY_IN_MILLISECONDS
        );

        await db.user.updateOneById(targetUserId, {
            passwordResetToken,
            passwordResetTokenExpires
        });

        await mailService.sendPasswordReset(
            user.email,
            user.username,
            passwordResetToken
        );

        await this.logAction(
            adminUserId,
            targetUserId,
            AdminAction.ForcePasswordReset
        );
    }

    @LogServiceMethod({ names: ['targetUserId'] })
    async verifyEmail(targetUserId: number): Promise<void> {
        const adminUserId = assertAdminAndNotSelf(targetUserId);
        const user = await this.requireUser(targetUserId);

        if (user.emailVerified) {
            throw new ValidationError(
                'admin.users.error.email-already-verified',
                ApplicationErrorCode.EMAIL_ALREADY_VERIFIED
            );
        }

        await db.admin.updateUserById(targetUserId, {
            emailVerified: true,
            emailVerificationToken: null
        });

        await this.logAction(
            adminUserId,
            targetUserId,
            AdminAction.VerifyEmail
        );
    }

    @LogServiceMethod({ names: ['targetUserId'] })
    async scheduleAccountDeletion(
        targetUserId: number,
        reason?: string
    ): Promise<void> {
        const adminUserId = assertAdminAndNotSelf(targetUserId);

        const user = await this.requireUser(targetUserId);

        const scheduledFor = new Date(
            Date.now() +
                ACCOUNT_DELETION_GRACE_PERIOD_DAYS * ONE_DAY_IN_MILLISECONDS
        );

        await db.user.markForDeletion(targetUserId, scheduledFor);

        // Invalidate sessions so the user sees the pending deletion state
        await sessions.invalidateAllUserSessions(targetUserId);

        await this.changeUserStatus(
            targetUserId,
            Status.Banned,
            'Admin deletion scheduled'
        );

        const proofHash = createHash('sha256')
            .update(`${targetUserId}-${scheduledFor.toISOString()}`)
            .digest('hex');

        await db.accountDeletionRequest.createOne({
            user: { connect: { id: targetUserId } },
            reason: reason ?? 'Admin initiated',
            ipAddress: RequestContext.getIp(),
            userAgent: RequestContext.getUserAgent(),
            proofHash,
            userEmail: user.email,
            userName: user.username
        });

        await this.logAction(
            adminUserId,
            targetUserId,
            AdminAction.ScheduleDeletion,
            {
                reason,
                scheduledFor: scheduledFor.toISOString()
            }
        );

        //|-------------------------------------------------------------------------------------|//
        //?                                   SEND EMAIL                                        ?//
        //|-------------------------------------------------------------------------------------|//

        try {
            const locale = RequestContext.getUserLocale() ?? DEFAULT_LOCALE;

            await mailService.sendAdminAccountDeletionNotice(
                user.email,
                user.username,
                scheduledFor.toLocaleDateString(locale)
            );
        } catch (error) {
            log.error('Failed to send admin account deletion notice email', {
                error,
                targetUserId
            });
            // Don't fail the operation if email fails
        }
    }

    @LogServiceMethod({ names: ['targetUserId'] })
    async cancelAccountDeletion(targetUserId: number): Promise<void> {
        const adminUserId = assertAdminAndNotSelf(targetUserId);

        const user = await this.requireUser(targetUserId);

        if (user.status !== Status.PendingDeletion) {
            throw new ValidationError(
                'admin.users.error.not-pending-deletion',
                ApplicationErrorCode.PRECONDITION_FAILED
            );
        }

        await db.user.cancelDeletion(targetUserId);

        const auditRecord =
            await db.accountDeletionRequest.getLatestByUserId(targetUserId);

        if (auditRecord) {
            await db.accountDeletionRequest.markAsCancelled(auditRecord.id);
        }

        await this.logAction(
            adminUserId,
            targetUserId,
            AdminAction.CancelDeletion
        );
    }

    //~=========================================================================================~//
    //$                                        HELPERS                                          $//
    //~=========================================================================================~//

    private async requireUser(userId: number) {
        const user = await db.admin.getUserById(userId);

        if (!user) {
            throw new NotFoundError(
                'admin.users.error.not-found',
                ApplicationErrorCode.USER_NOT_FOUND
            );
        }

        return user;
    }

    private async logAction(
        adminUserId: number,
        targetUserId: number,
        action: AdminAction,
        details?: object
    ): Promise<void> {
        try {
            await db.adminActionLog.createOne({
                adminUserId,
                targetUserId,
                action,
                details
            });
        } catch (error: unknown) {
            // Audit log failure should not break the main operation
            log.error('logAction - failed to write audit log', {
                error,
                adminUserId,
                targetUserId,
                action
            });
        }
    }
}

export const adminService = new AdminService();
