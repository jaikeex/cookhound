import { mailClient } from '@/server/integrations';
import { BaseJob } from '@/server/queues/BaseJob';
import type { Job } from 'bullmq';
import { queueManager } from '@/server/queues/QueueManager';
import { JOB_NAMES, QUEUE_NAMES } from '@/server/queues/jobs/names';
import { FROM_ADDRESS, QUEUE_OPTIONS } from './constants';
import { Logger } from '@/server/logger';
import { adminReportNotificationTpl } from './templates/admin-report-notification';
import { createTemplate } from './utils';
import { ENV_CONFIG_PRIVATE } from '@/common/constants/env';

const log = Logger.getInstance('admin-report-notification-worker');

type AdminReportNotificationData = {
    reportId: number;
    targetType: string;
    targetLabel: string;
    targetUrl: string;
    reason: string;
    details: string;
    reporterId: number;
};

class SendAdminReportNotificationJob extends BaseJob<AdminReportNotificationData> {
    static jobName = JOB_NAMES.SEND_ADMIN_REPORT_NOTIFICATION;
    static queueName = QUEUE_NAMES.EMAILS;
    static queueOptions = QUEUE_OPTIONS;

    async handle(job: Job<AdminReportNotificationData>) {
        const {
            reportId,
            targetType,
            targetLabel,
            targetUrl,
            reason,
            details,
            reporterId
        } = job.data;

        log.trace('handle - sending admin report notification', {
            reportId,
            targetType
        });

        const { subject, html } = createTemplate(
            adminReportNotificationTpl,
            reportId,
            targetType,
            targetLabel,
            targetUrl,
            reason,
            details,
            reporterId
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

        log.notice('admin report notification email sent', { reportId });
    }
}

queueManager.registerJob(new SendAdminReportNotificationJob().getDefinition());
