import {
    AuthErrorForbidden,
    ConflictError,
    NotFoundError
} from '@/server/error';
import { ApplicationErrorCode } from '@/server/error/codes';
import { Logger, LogServiceMethod } from '@/server/logger';
import { assertAuthenticated } from '@/server/utils/reqwest/guards';
import db from '@/server/db/model';
import {
    RecipeFlagAppealStatus,
    type RecipeFlagAppealDTO
} from '@/common/types/flags/recipe-flag-appeal';
import { mailService } from '@/server/services/mail/service';
import { notificationService } from '@/server/services/notification/service';
import type { RecipeFlagReason } from '@/common/constants';

//|=============================================================================================|//

const LOG_CONTEXT = 'recipe-flag-service';
const log = Logger.getInstance(LOG_CONTEXT);

/**
 * Manages recipe content flags and the user-submitted appeals filed against them.
 */
class RecipeFlagService {
    static readonly LOG_CONTEXT = LOG_CONTEXT;

    /**
     * Create a new appeal for an active recipe flag. Enforces three invariants
     * at the service layer:
     *  - the flag exists and is active,
     *  - the caller authored the parent recipe,
     *  - no pending appeal already exists for this flag.
     *
     * @param flagId - Database ID of the flag being appealed.
     * @param message - Free-text justification (10-2000 chars, validated upstream).
     * @returns The persisted appeal as a DTO.
     * @throws {NotFoundError} If the flag does not exist.
     * @throws {AuthErrorForbidden} If the caller is not the recipe's author.
     * @throws {ConflictError} If the flag is inactive or already has a pending appeal.
     */
    @LogServiceMethod({ names: ['flagId'] })
    async createAppeal(
        flagId: number,
        message: string
    ): Promise<RecipeFlagAppealDTO> {
        const userId = assertAuthenticated();

        const flag = await db.recipeFlag.getOneById(flagId);

        if (!flag) {
            log.info('createAppeal - flag not found', { flagId });
            throw new NotFoundError(
                'app.error.not-found',
                ApplicationErrorCode.FLAG_NOT_FOUND
            );
        }

        if (flag.recipe.authorId !== userId) {
            log.warn('createAppeal - access denied', {
                flagId,
                recipeId: flag.recipeId
            });
            throw new AuthErrorForbidden(
                'app.error.bad-request',
                ApplicationErrorCode.RECIPE_ACCESS_DENIED
            );
        }

        if (!flag.active) {
            log.info('createAppeal - flag is no longer active', { flagId });
            throw new ConflictError(
                'recipe.flag.appeal.error.flag-not-active',
                ApplicationErrorCode.FLAG_NOT_ACTIVE
            );
        }

        const existingPending =
            await db.recipeFlag.getPendingAppealByFlagId(flagId);

        if (existingPending) {
            log.info('createAppeal - pending appeal already exists', {
                flagId,
                existingAppealId: existingPending.id
            });
            throw new ConflictError(
                'recipe.flag.appeal.error.already-pending',
                ApplicationErrorCode.APPEAL_ALREADY_PENDING
            );
        }

        const appeal = await db.recipeFlag.createAppeal(
            flagId,
            userId,
            message
        );

        try {
            await mailService.sendFlagAppealNotification({
                appealId: appeal.id,
                flagId: flag.id,
                flagReason: flag.reason as RecipeFlagReason,
                recipeId: flag.recipe.id,
                recipeDisplayId: flag.recipe.displayId,
                recipeTitle: flag.recipe.title,
                authorId: userId,
                message
            });
        } catch (error: unknown) {
            // Notification failure must not block the appeal, the row is
            // persisted and admins can find it on next sweep.
            log.warn('createAppeal - failed to enqueue admin notification', {
                error,
                appealId: appeal.id
            });
        }

        notificationService.notifyFlagAppealCreated({
            appealId: appeal.id,
            recipeTitle: flag.recipe.title,
            flagReason: flag.reason
        });

        return this.toAppealDTO(appeal);
    }

    private toAppealDTO(appeal: {
        id: number;
        flagId: number;
        userId: number;
        message: string;
        status: string;
        reviewedById: number | null;
        reviewedAt: Date | null;
        createdAt: Date;
    }): RecipeFlagAppealDTO {
        return {
            id: appeal.id,
            flagId: appeal.flagId,
            userId: appeal.userId,
            message: appeal.message,
            status: appeal.status as RecipeFlagAppealStatus,
            reviewedById: appeal.reviewedById,
            reviewedAt: appeal.reviewedAt,
            createdAt: appeal.createdAt
        };
    }
}

export const recipeFlagService = new RecipeFlagService();
