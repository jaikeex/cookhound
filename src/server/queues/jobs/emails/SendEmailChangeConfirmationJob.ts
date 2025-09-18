import { mailClient } from '@/server/integrations';
import { BaseJob } from '@/server/queues/BaseJob';
import type { Job } from 'bullmq';
import { queueManager } from '@/server/queues/QueueManager';
import { JOB_NAMES, QUEUE_NAMES } from '@/server/queues/jobs/names';
import { FROM_ADDRESS, FROM_NAME, QUEUE_OPTIONS } from './constants';
import { Logger } from '@/server/logger';
import { ENV_CONFIG_PUBLIC } from '@/common/constants';
import { emailChangeConfirmationTemplate } from './templates/email-change-confirmation';

const log = Logger.getInstance('email-change-confirmation-worker');

type EmailChangeConfirmationData = {
    token: string;
    to: { address: string; name: string };
};

class SendEmailChangeConfirmationJob extends BaseJob<EmailChangeConfirmationData> {
    static jobName = JOB_NAMES.SEND_EMAIL_CHANGE_CONFIRMATION;
    static queueName = QUEUE_NAMES.EMAILS;
    static queueOptions = QUEUE_OPTIONS;

    async handle(job: Job<EmailChangeConfirmationData>) {
        const { token, to } = job.data;

        log.trace('handle - sending email change confirmation', to);

        const confirmationLink = `${ENV_CONFIG_PUBLIC.ORIGIN}/auth/verify-email-change?token=${token}`;
        const html = emailChangeConfirmationTemplate(to.name, confirmationLink);

        await mailClient.send({
            from: { name: FROM_NAME, address: FROM_ADDRESS },
            to,
            subject: 'Confirm your new email address',
            html
        });

        log.notice('email change confirmation sent', to);
    }
}

queueManager.registerJob(new SendEmailChangeConfirmationJob().getDefinition());
