import { mailClient } from '@/server/integrations';
import { BaseJob } from '@/server/queues/BaseJob';
import type { Job } from 'bullmq';
import { accountDeletionReminderTpl } from './templates/account-deletion-reminder';
import { createTemplate } from './utils';
import type { Locale } from '@/common/types';
import { Logger } from '@/server/logger';
import { queueManager } from '@/server/queues/QueueManager';
import { JOB_NAMES, QUEUE_NAMES } from '@/server/queues/jobs/names';
import { FROM_ADDRESS, FROM_NAME, QUEUE_OPTIONS } from './constants';

const log = Logger.getInstance('deletion-reminder-worker');

type AccountDeletionReminderJobData = {
    daysRemaining: number;
    scheduledDate: string;
    to: { address: string; name: string };
    locale: Locale;
};

class SendAccountDeletionReminderJob extends BaseJob<AccountDeletionReminderJobData> {
    static jobName = JOB_NAMES.SEND_ACCOUNT_DELETION_REMINDER;
    static queueName = QUEUE_NAMES.EMAILS;
    static queueOptions = QUEUE_OPTIONS;

    async handle(job: Job<AccountDeletionReminderJobData>) {
        const { daysRemaining, scheduledDate, to, locale } = job.data;

        log.trace('handle - attempting to send account deletion reminder', to);

        const { subject, html } = createTemplate(
            accountDeletionReminderTpl,
            locale,
            to.name,
            daysRemaining,
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

        log.notice('account deletion reminder email sent', to);
    }
}

queueManager.registerJob(new SendAccountDeletionReminderJob().getDefinition());
