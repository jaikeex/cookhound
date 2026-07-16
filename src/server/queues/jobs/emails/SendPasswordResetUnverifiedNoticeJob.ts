import { mailClient } from '@/server/integrations';
import { BaseJob } from '@/server/queues/BaseJob';
import type { Job } from 'bullmq';
import { ENV_CONFIG_PUBLIC } from '@/common/constants';
import { Logger } from '@/server/logger';
import { queueManager } from '@/server/queues/QueueManager';
import { JOB_NAMES, QUEUE_NAMES } from '@/server/queues/jobs/names';
import { FROM_ADDRESS, FROM_NAME, QUEUE_OPTIONS } from './constants';
import { passwordResetUnverifiedNoticeTpl } from './templates/password-reset-unverified-notice';
import type { Locale } from '@/common/types';
import { createTemplate } from './utils';

const log = Logger.getInstance('password-reset-unverified-notice-worker');

type PasswordResetUnverifiedNoticeData = {
    to: { address: string; name: string };
    locale: Locale;
};

class SendPasswordResetUnverifiedNoticeJob extends BaseJob<PasswordResetUnverifiedNoticeData> {
    static jobName = JOB_NAMES.SEND_PASSWORD_RESET_UNVERIFIED_NOTICE;
    static queueName = QUEUE_NAMES.EMAILS;
    static queueOptions = QUEUE_OPTIONS;

    async handle(job: Job<PasswordResetUnverifiedNoticeData>) {
        const { to, locale } = job.data;

        log.trace('handle - sending password reset unverified notice', to);

        const verify_link = `${ENV_CONFIG_PUBLIC.ORIGIN}/auth/verify-email`;
        const { subject, html } = createTemplate(
            passwordResetUnverifiedNoticeTpl,
            locale,
            to.name,
            verify_link
        );

        await mailClient.send({
            from: { name: FROM_NAME, address: FROM_ADDRESS },
            to,
            subject,
            html
        });

        log.notice('password reset unverified notice sent', to);
    }
}

queueManager.registerJob(
    new SendPasswordResetUnverifiedNoticeJob().getDefinition()
);
