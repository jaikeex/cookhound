import { mailClient } from '@/server/integrations';
import { BaseJob } from '@/server/queues/BaseJob';
import type { Job } from 'bullmq';
import { accountDeletionConfirmationTpl } from './templates/account-deletion-confirmation';
import { createTemplate } from './utils';
import type { Locale } from '@/common/types';
import { Logger } from '@/server/logger';
import { queueManager } from '@/server/queues/QueueManager';
import { JOB_NAMES, QUEUE_NAMES } from '@/server/queues/jobs/names';
import { FROM_ADDRESS, FROM_NAME, QUEUE_OPTIONS } from './constants';

const log = Logger.getInstance('deletion-confirm-worker');

type AccountDeletionConfirmationJobData = {
    scheduledDate: string;
    to: { address: string; name: string };
    locale: Locale;
};

class SendAccountDeletionConfirmationJob extends BaseJob<AccountDeletionConfirmationJobData> {
    static jobName = JOB_NAMES.SEND_ACCOUNT_DELETION_CONFIRMATION;
    static queueName = QUEUE_NAMES.EMAILS;
    static queueOptions = QUEUE_OPTIONS;

    async handle(job: Job<AccountDeletionConfirmationJobData>) {
        const { scheduledDate, to, locale } = job.data;

        log.trace(
            'handle - attempting to send account deletion confirmation',
            to
        );

        const { subject, html } = createTemplate(
            accountDeletionConfirmationTpl,
            locale,
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

        log.notice('account deletion confirmation email sent', to);
    }
}

queueManager.registerJob(
    new SendAccountDeletionConfirmationJob().getDefinition()
);
