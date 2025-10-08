import { mailClient } from '@/server/integrations';
import { BaseJob } from '@/server/queues/BaseJob';
import type { Job } from 'bullmq';
import { accountDeletedTpl } from './templates/account-deleted';
import { createTemplate } from './utils';
import type { Locale } from '@/common/types';
import { Logger } from '@/server/logger';
import { queueManager } from '@/server/queues/QueueManager';
import { JOB_NAMES, QUEUE_NAMES } from '@/server/queues/jobs/names';
import { FROM_ADDRESS, FROM_NAME, QUEUE_OPTIONS } from './constants';

const log = Logger.getInstance('account-deleted-worker');

type AccountDeletedJobData = {
    to: { address: string; name: string };
    locale: Locale;
};

class SendAccountDeletedJob extends BaseJob<AccountDeletedJobData> {
    static jobName = JOB_NAMES.SEND_ACCOUNT_DELETED;
    static queueName = QUEUE_NAMES.EMAILS;
    static queueOptions = QUEUE_OPTIONS;

    async handle(job: Job<AccountDeletedJobData>) {
        const { to, locale } = job.data;

        log.trace('handle - attempting to send account deleted', to);

        const { subject, html } = createTemplate(
            accountDeletedTpl,
            locale,
            to.name
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

        log.notice('account deleted email sent', to);
    }
}

queueManager.registerJob(new SendAccountDeletedJob().getDefinition());
