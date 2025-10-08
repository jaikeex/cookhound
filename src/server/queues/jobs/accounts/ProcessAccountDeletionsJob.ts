import { BaseJob } from '@/server/queues/BaseJob';
import type { Job } from 'bullmq';
import { Logger } from '@/server/logger';
import { queueManager } from '@/server/queues/QueueManager';
import { JOB_NAMES, QUEUE_NAMES } from '@/server/queues/jobs/names';
import { QUEUE_OPTIONS } from './constants';
import { InfrastructureError } from '@/server/error/server';
import { InfrastructureErrorCode } from '@/server/error/codes';
import { userService } from '@/server/services';

const log = Logger.getInstance('process-deletions-worker');

type ProcessAccountDeletionsJobData = Record<string, never>;

/**
 * Background job that processes scheduled account deletions.
 * Runs daily via cron to check for accounts past their grace period
 * and performs the hard deletion + data anonymization.
 */
class ProcessAccountDeletionsJob extends BaseJob<ProcessAccountDeletionsJobData> {
    static jobName = JOB_NAMES.PROCESS_ACCOUNT_DELETIONS;
    static queueName = QUEUE_NAMES.ACCOUNTS;
    static queueOptions = QUEUE_OPTIONS;

    async handle(job: Job<ProcessAccountDeletionsJobData>) {
        log.info('handle - starting account deletions processing');

        try {
            const result = await userService.processScheduledDeletions();

            log.info('handle - account deletions processed successfully', {
                processed: result.processed,
                failed: result.failed,
                jobId: job.id
            });

            if (result.failed > 0) {
                log.warn('handle - some deletions failed', {
                    failed: result.failed,
                    processed: result.processed
                });
            }
        } catch (error: unknown) {
            log.error('handle - failed to process account deletions', {
                error,
                jobId: job.id
            });
            throw new InfrastructureError(
                InfrastructureErrorCode.QUEUE_JOB_PROCESS_FAILED
            );
        }
    }
}

queueManager.registerJob(new ProcessAccountDeletionsJob().getDefinition());
