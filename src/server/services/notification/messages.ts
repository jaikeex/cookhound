import { truncate } from '@/common/utils';
import type { NtfyNotificationJobData } from './types';

//|=============================================================================================|//

const MAX_DYNAMIC_TEXT_LENGTH = 200;

/**
 * Builders producing the fully rendered ntfy payload for every app event.
 */
export const ntfyMessages = Object.freeze({
    newUser(): NtfyNotificationJobData {
        return {
            event: 'new_user',
            title: 'New user',
            message: `A new user has joined the app!`,
            priority: 2,
            tags: ['wave']
        };
    },

    newRecipe(title: string): NtfyNotificationJobData {
        return {
            event: 'new_recipe',
            title: 'New recipe',
            message: `${truncate(title, MAX_DYNAMIC_TEXT_LENGTH)}`,
            priority: 2,
            tags: ['fork_and_knife']
        };
    },

    recipeFlagged(title: string, reason: string): NtfyNotificationJobData {
        return {
            event: 'recipe_flagged',
            title: 'Recipe flagged',
            message: `"${truncate(title, MAX_DYNAMIC_TEXT_LENGTH)}" flagged: ${reason}`,
            priority: 4,
            tags: ['triangular_flag_on_post']
        };
    },

    recipeReinstated(
        title: string,
        clearedFlags: number
    ): NtfyNotificationJobData {
        return {
            event: 'recipe_reinstated',
            title: 'Recipe re-accepted',
            message: `"${truncate(title, MAX_DYNAMIC_TEXT_LENGTH)}" passed re-evaluation, ${clearedFlags} flag(s) cleared`,
            priority: 3,
            tags: ['white_check_mark']
        };
    },

    flagAppealCreated(payload: {
        appealId: number;
        recipeTitle: string;
        flagReason: string;
    }): NtfyNotificationJobData {
        return {
            event: 'flag_appeal_created',
            title: 'Flag appeal submitted',
            message: `Appeal #${payload.appealId} on "${truncate(payload.recipeTitle, MAX_DYNAMIC_TEXT_LENGTH)}" (flag: ${payload.flagReason})`,
            priority: 4,
            tags: ['scales']
        };
    },

    contentReported(payload: {
        reportId: number;
        targetType: string;
        targetLabel: string;
        reason: string;
    }): NtfyNotificationJobData {
        return {
            event: 'content_reported',
            title: 'Content reported',
            message: `Report #${payload.reportId} on ${payload.targetType} "${truncate(payload.targetLabel, MAX_DYNAMIC_TEXT_LENGTH)}" (${payload.reason})`,
            priority: 4,
            tags: ['rotating_light']
        };
    },

    accountDeletionRequested(hasReason: boolean): NtfyNotificationJobData {
        return {
            event: 'account_deletion_requested',
            title: 'Account deletion requested',
            message: `A user requested account deletion (in 30 days)${hasReason ? ', reason given' : ''}`,
            priority: 3,
            tags: ['wastebasket']
        };
    }
});
