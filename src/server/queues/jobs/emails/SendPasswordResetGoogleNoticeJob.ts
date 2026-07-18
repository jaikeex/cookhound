import { mailClient } from '@/server/integrations';
import { BaseJob } from '@/server/queues/BaseJob';
import type { Job } from 'bullmq';
import { ENV_CONFIG_PUBLIC, ROUTES } from '@/common/constants';
import { Logger } from '@/server/logger';
import { queueManager } from '@/server/queues/QueueManager';
import { JOB_NAMES, QUEUE_NAMES } from '@/server/queues/jobs/names';
import { FROM_ADDRESS, FROM_NAME, QUEUE_OPTIONS } from './constants';
import { passwordResetGoogleNoticeTpl } from './templates/password-reset-google-notice';
import type { Locale } from '@/common/types';
import { createTemplate } from './utils';

const log = Logger.getInstance('password-reset-google-notice-worker');

type PasswordResetGoogleNoticeData = {
    to: { address: string; name: string };
    locale: Locale;
};

class SendPasswordResetGoogleNoticeJob extends BaseJob<PasswordResetGoogleNoticeData> {
    static jobName = JOB_NAMES.SEND_PASSWORD_RESET_GOOGLE_NOTICE;
    static queueName = QUEUE_NAMES.EMAILS;
    static queueOptions = QUEUE_OPTIONS;

    async handle(job: Job<PasswordResetGoogleNoticeData>) {
        const { to, locale } = job.data;

        log.trace('handle - sending password reset google notice', to);

        const login_link = `${ENV_CONFIG_PUBLIC.ORIGIN}${ROUTES.auth.login}`;
        const { subject, html } = createTemplate(
            passwordResetGoogleNoticeTpl,
            locale,
            to.name,
            login_link
        );

        await mailClient.send({
            from: { name: FROM_NAME, address: FROM_ADDRESS },
            to,
            subject,
            html
        });

        log.notice('password reset google notice sent', to);
    }
}

queueManager.registerJob(
    new SendPasswordResetGoogleNoticeJob().getDefinition()
);
