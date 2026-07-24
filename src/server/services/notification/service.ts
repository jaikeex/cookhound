import { Logger, LogServiceMethod } from '@/server/logger';
import { queueManager } from '@/server/queues/QueueManager';
import { JOB_NAMES } from '@/server/queues/jobs/names';
import { ntfyMessages } from './messages';
import type { NtfyNotificationJobData } from './types';
import ntfyClient from '@/server/integrations/ntfy/client';

//|=============================================================================================|//

const LOG_CONTEXT = 'notification-service';
const log = Logger.getInstance(LOG_CONTEXT);

/**
 * Enqueues ntfy push notifications.
 *
 * Notifications are pure telemetry. No method here should ever throw an error
 * because a push could not be enqueued.
 */
class NotificationService {
    static readonly LOG_CONTEXT = LOG_CONTEXT;

    //|-----------------------------------------------------------------------------------------|//
    //?                                         EVENTS                                          ?//
    //|-----------------------------------------------------------------------------------------|//

    @LogServiceMethod()
    async notifyNewUser(): Promise<void> {
        await this.enqueue(ntfyMessages.newUser());
    }

    @LogServiceMethod({ names: ['title'] })
    async notifyNewRecipe(title: string): Promise<void> {
        await this.enqueue(ntfyMessages.newRecipe(title));
    }

    @LogServiceMethod({ names: ['title', 'reason'] })
    async notifyRecipeFlagged(title: string, reason: string): Promise<void> {
        await this.enqueue(ntfyMessages.recipeFlagged(title, reason));
    }

    @LogServiceMethod({ names: ['title', 'clearedFlags'] })
    async notifyRecipeReinstated(
        title: string,
        clearedFlags: number
    ): Promise<void> {
        await this.enqueue(ntfyMessages.recipeReinstated(title, clearedFlags));
    }

    @LogServiceMethod({ names: ['payload'] })
    async notifyFlagAppealCreated(payload: {
        appealId: number;
        recipeTitle: string;
        flagReason: string;
    }): Promise<void> {
        await this.enqueue(ntfyMessages.flagAppealCreated(payload));
    }

    @LogServiceMethod({ names: ['payload'] })
    async notifyContentReported(payload: {
        reportId: number;
        targetType: string;
        targetLabel: string;
        reason: string;
    }): Promise<void> {
        await this.enqueue(ntfyMessages.contentReported(payload));
    }

    @LogServiceMethod({ names: ['hasReason'] })
    async notifyAccountDeletionRequested(hasReason: boolean): Promise<void> {
        await this.enqueue(ntfyMessages.accountDeletionRequested(hasReason));
    }

    //|-----------------------------------------------------------------------------------------|//
    //?                                         ENQUEUE                                         ?//
    //|-----------------------------------------------------------------------------------------|//

    private async enqueue(payload: NtfyNotificationJobData): Promise<void> {
        if (!ntfyClient.isConfigured) return;

        try {
            await queueManager.addJob(
                JOB_NAMES.SEND_NTFY_NOTIFICATION,
                payload
            );
        } catch (error: unknown) {
            log.warn('enqueue - failed to enqueue ntfy notification', {
                error,
                event: payload.event
            });
        }
    }
}

export const notificationService = new NotificationService();
