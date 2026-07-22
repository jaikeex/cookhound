import { describe, it, expect, vi, beforeEach } from 'vitest';

//|=============================================================================================|//
//$                                           MOCKS                                             $//
//|=============================================================================================|//

//? vitest mocks need to be hoisted to the top, it throws otherwise

vi.mock('@/server/queues/QueueManager', () => ({
    queueManager: {
        addJob: vi.fn()
    }
}));

vi.mock('@/server/integrations/ntfy/client', () => ({
    default: {
        isConfigured: true
    }
}));

//|=============================================================================================|//
//$                                          IMPORTS                                            $//
//|=============================================================================================|//

import { notificationService } from './service';
import { queueManager } from '@/server/queues/QueueManager';
import { JOB_NAMES } from '@/server/queues/jobs/names';

const mockAddJob = vi.mocked(queueManager.addJob);

//|=============================================================================================|//
//$                                           TESTS                                             $//
//|=============================================================================================|//

describe('NotificationService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('enqueues the ntfy notification job with the rendered payload', async () => {
        mockAddJob.mockResolvedValue({} as never);

        await notificationService.notifyNewUser();

        expect(mockAddJob).toHaveBeenCalledTimes(1);
        expect(mockAddJob).toHaveBeenCalledWith(
            JOB_NAMES.SEND_NTFY_NOTIFICATION,
            expect.objectContaining({
                event: 'new_user',
                title: 'New user'
            })
        );
    });

    /**
     * The swallow contract: operator notifications are telemetry and must
     * never fail the calling flow (an unswallowed failure inside
     * EvaluateRecipeJob would retry the job and re-flag the recipe).
     */
    it('resolves without throwing when the enqueue fails', async () => {
        mockAddJob.mockRejectedValue(new Error('redis is down'));

        await expect(
            notificationService.notifyNewUser()
        ).resolves.toBeUndefined();
        await expect(
            notificationService.notifyNewRecipe('title')
        ).resolves.toBeUndefined();
        await expect(
            notificationService.notifyRecipeFlagged('title', 'spam')
        ).resolves.toBeUndefined();
        await expect(
            notificationService.notifyRecipeReinstated('title', 1)
        ).resolves.toBeUndefined();
        await expect(
            notificationService.notifyFlagAppealCreated({
                appealId: 1,
                recipeTitle: 'title',
                flagReason: 'spam'
            })
        ).resolves.toBeUndefined();
        await expect(
            notificationService.notifyAccountDeletionRequested(true)
        ).resolves.toBeUndefined();
    });
});
