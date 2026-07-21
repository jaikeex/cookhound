import { mailClient } from '@/server/integrations';
import { BaseJob } from '@/server/queues/BaseJob';
import type { Job } from 'bullmq';
import { adminAccountDeletionNoticeTpl } from './templates/admin-account-deletion-notice';
import { createTemplate } from './utils';
import { Logger } from '@/server/logger';
import { queueManager } from '@/server/queues/QueueManager';
import { JOB_NAMES, QUEUE_NAMES } from '@/server/queues/jobs/names';
import { FROM_ADDRESS, FROM_NAME, QUEUE_OPTIONS } from './constants';

const log = Logger.getInstance('admin-deletion-notice-worker');

type AdminAccountDeletionNoticeJobData = {
    scheduledDate: string;
    to: { address: string; name: string };
};

class SendAdminAccountDeletionNoticeJob extends BaseJob<AdminAccountDeletionNoticeJobData> {
    static jobName = JOB_NAMES.SEND_ADMIN_ACCOUNT_DELETION_NOTICE;
    static queueName = QUEUE_NAMES.EMAILS;
    static queueOptions = QUEUE_OPTIONS;

    async handle(job: Job<AdminAccountDeletionNoticeJobData>) {
        const { scheduledDate, to } = job.data;

        log.trace(
            'handle - attempting to send admin account deletion notice',
            to
        );

        const { subject, html } = createTemplate(
            adminAccountDeletionNoticeTpl,
            to.name,
            scheduledDate
        );

        await mailClient.send({
            from: {
                name: FROM_NAME,
                address: FROM_ADDRESS
            },
            subject,
            to,
            html
        });

        log.notice('admin account deletion notice email sent', to);
    }
}

queueManager.registerJob(
    new SendAdminAccountDeletionNoticeJob().getDefinition()
);
