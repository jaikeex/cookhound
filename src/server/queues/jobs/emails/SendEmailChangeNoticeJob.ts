import { mailClient } from '@/server/integrations';
import { BaseJob } from '@/server/queues/BaseJob';
import type { Job } from 'bullmq';
import { queueManager } from '@/server/queues/QueueManager';
import { JOB_NAMES, QUEUE_NAMES } from '@/server/queues/jobs/names';
import { FROM_ADDRESS, FROM_NAME, QUEUE_OPTIONS } from './constants';
import { Logger } from '@/server/logger';
import { emailChangeNoticeTpl } from './templates/email-change-notice';
import type { Locale } from '@/common/types';
import { createTemplate } from './utils';

const log = Logger.getInstance('email-change-notice-worker');

type EmailChangeNoticeData = {
    to: { address: string; name: string };
    locale: Locale;
};

class SendEmailChangeNoticeJob extends BaseJob<EmailChangeNoticeData> {
    static jobName = JOB_NAMES.SEND_EMAIL_CHANGE_NOTICE;
    static queueName = QUEUE_NAMES.EMAILS;
    static queueOptions = QUEUE_OPTIONS;

    async handle(job: Job<EmailChangeNoticeData>) {
        const { to, locale } = job.data;

        log.trace('handle - sending email change notice', to);

        const { subject, html } = createTemplate(
            emailChangeNoticeTpl,
            locale,
            to.name
        );

        await mailClient.send({
            from: { name: FROM_NAME, address: FROM_ADDRESS },
            to,
            subject,
            html
        });

        log.notice('email change notice sent', to);
    }
}

queueManager.registerJob(new SendEmailChangeNoticeJob().getDefinition());
