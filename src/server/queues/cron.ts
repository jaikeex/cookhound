import { InfrastructureError } from '@/server/error';
import { queueManager } from './QueueManager';
import { JOB_NAMES, QUEUE_NAMES } from './jobs/names';
import { Logger } from '@/server/logger';
import { InfrastructureErrorCode } from '@/server/error/codes';

const log = Logger.getInstance('queue-crons');

const CRON_JOBS = [
    {
        name: JOB_NAMES.REINDEX_RECIPES,
        queueName: QUEUE_NAMES.SEARCH,
        cron: '0 1 * * *', // 1:00 AM
        enabled: true
    }
];

/**
 * Registers all recurring (cron-based) jobs with BullMQ. This function should be called from
 * the dedicated worker runtime AFTER the QueueManager has been initialised.
 */
export async function scheduleRecurringJobs(): Promise<void> {
    try {
        for (const job of CRON_JOBS) {
            await queueManager.scheduleCronJob(job);
        }

        log.info('scheduleRecurringJobs - cron jobs scheduled');
    } catch (error: unknown) {
        log.errorWithStack(
            'scheduleRecurringJobs - failed to schedule cron jobs',
            error
        );
        // rethrow so that worker start-up fails in a controlled way – without this cron the
        // search index might silently drift out of sync.
        throw new InfrastructureError(
            InfrastructureErrorCode.CRON_SCHEDULER_FAILED
        );
    }
}
