import { ntfyClient } from '@/server/integrations';
import { BaseJob } from '@/server/queues/BaseJob';
import type { Job } from 'bullmq';
import { queueManager } from '@/server/queues/QueueManager';
import { JOB_NAMES, QUEUE_NAMES } from '@/server/queues/jobs/names';
import { QUEUE_OPTIONS } from './constants';
import { Logger } from '@/server/logger';
import { InfrastructureError } from '@/server/error';
import { InfrastructureErrorCode } from '@/server/error/codes';
import type { NtfyNotificationJobData } from '@/server/services/notification/types';

const log = Logger.getInstance('ntfy-notification-worker');

class SendNtfyNotificationJob extends BaseJob<NtfyNotificationJobData> {
    static jobName = JOB_NAMES.SEND_NTFY_NOTIFICATION;
    static queueName = QUEUE_NAMES.NOTIFICATIONS;
    static queueOptions = QUEUE_OPTIONS;

    async handle(job: Job<NtfyNotificationJobData>) {
        const { event } = job.data;

        if (!ntfyClient.isConfigured) {
            log.trace('handle - NTFY_TOPIC not set, skipping', { event });
            return;
        }

        const delivered = await ntfyClient.publish(job.data);

        if (!delivered) {
            throw new InfrastructureError(
                InfrastructureErrorCode.QUEUE_JOB_PROCESS_FAILED
            );
        }

        log.notice('ntfy notification sent', { event });
    }
}

queueManager.registerJob(new SendNtfyNotificationJob().getDefinition());
