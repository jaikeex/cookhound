import { mailClient } from '@/server/integrations';
import { BaseJob } from '@/server/queues/BaseJob';
import type { Job } from 'bullmq';
import { emailVerificationTpl } from './templates/email-verification';
import { createTemplate } from './utils';
import type { Locale } from '@/common/types';
import { ENV_CONFIG_PUBLIC } from '@/common/constants';
import { Logger } from '@/server/logger';
import { queueManager } from '@/server/queues/QueueManager';
import { JOB_NAMES, QUEUE_NAMES } from '@/server/queues/jobs/names';
import { FROM_ADDRESS, FROM_NAME, QUEUE_OPTIONS } from './constants';

const log = Logger.getInstance('verif-email-worker');

type VerificationEmailJobData = {
    token: string;
    to: {
        address: string;
        name: string;
    };
    locale: Locale;
};

class SendVerificationEmailJob extends BaseJob<VerificationEmailJobData> {
    static jobName = JOB_NAMES.SEND_VERIFICATION_EMAIL;
    static queueName = QUEUE_NAMES.EMAILS;
    static queueOptions = QUEUE_OPTIONS;

    async handle(job: Job<VerificationEmailJobData>) {
        const { token, to, locale } = job.data;

        log.trace('handle - attempting to send verification email', to);

        const encodedToken = encodeURIComponent(token);
        const encodedEmail = encodeURIComponent(to.address);

        const verificationLink = `${ENV_CONFIG_PUBLIC.ORIGIN}/auth/callback/verify-email?token=${encodedToken}&email=${encodedEmail}`;

        const { subject, html } = createTemplate(
            emailVerificationTpl,
            locale,
            to.name,
            verificationLink
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

        log.notice('verification email sent', to);
    }
}

queueManager.registerJob(new SendVerificationEmailJob().getDefinition());
