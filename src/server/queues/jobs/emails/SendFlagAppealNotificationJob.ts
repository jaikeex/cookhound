import { mailClient } from '@/server/integrations';
import { BaseJob } from '@/server/queues/BaseJob';
import type { Job } from 'bullmq';
import { queueManager } from '@/server/queues/QueueManager';
import { JOB_NAMES, QUEUE_NAMES } from '@/server/queues/jobs/names';
import { FROM_ADDRESS, QUEUE_OPTIONS } from './constants';
import { Logger } from '@/server/logger';
import { flagAppealNotificationTpl } from './templates/flag-appeal-notification';
import type { Locale } from '@/common/types';
import { createTemplate } from './utils';
import { ENV_CONFIG_PRIVATE } from '@/common/constants/env';

const log = Logger.getInstance('flag-appeal-notification-worker');

type FlagAppealNotificationData = {
    appealId: number;
    flagId: number;
    flagReason: string;
    recipeId: number;
    recipeDisplayId: string;
    recipeTitle: string;
    authorId: number;
    message: string;
    locale: Locale;
};

class SendFlagAppealNotificationJob extends BaseJob<FlagAppealNotificationData> {
    static jobName = JOB_NAMES.SEND_FLAG_APPEAL_NOTIFICATION;
    static queueName = QUEUE_NAMES.EMAILS;
    static queueOptions = QUEUE_OPTIONS;

    async handle(job: Job<FlagAppealNotificationData>) {
        const {
            appealId,
            flagId,
            flagReason,
            recipeId,
            recipeDisplayId,
            recipeTitle,
            authorId,
            message,
            locale
        } = job.data;

        log.trace('handle - sending flag appeal notification', {
            appealId,
            flagId,
            recipeId
        });

        const { subject, html } = createTemplate(
            flagAppealNotificationTpl,
            locale,
            appealId,
            flagId,
            flagReason,
            recipeId,
            recipeDisplayId,
            recipeTitle,
            authorId,
            message
        );

        await mailClient.send({
            from: { name: 'Cookhound Moderation', address: FROM_ADDRESS },
            to: {
                name: 'Cookhound Support',
                address: ENV_CONFIG_PRIVATE.CONTACT_EMAIL
            },
            subject,
            html
        });

        log.notice('flag appeal notification email sent', {
            appealId,
            flagId,
            recipeId
        });
    }
}

queueManager.registerJob(new SendFlagAppealNotificationJob().getDefinition());
