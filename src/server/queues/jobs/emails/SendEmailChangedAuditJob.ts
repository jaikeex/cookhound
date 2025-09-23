import { mailClient } from '@/server/integrations';
import { BaseJob } from '@/server/queues/BaseJob';
import type { Job } from 'bullmq';
import { queueManager } from '@/server/queues/QueueManager';
import { JOB_NAMES, QUEUE_NAMES } from '@/server/queues/jobs/names';
import { FROM_ADDRESS, FROM_NAME, QUEUE_OPTIONS } from './constants';
import { Logger } from '@/server/logger';
import { emailChangedAuditTpl } from './templates/email-changed-audit';
import type { Locale } from '@/common/types';
import { createTemplate } from './utils';

const log = Logger.getInstance('email-changed-audit-worker');

type EmailChangedAuditData = {
    toOld: { address: string; name: string };
    toNew: { address: string; name: string };
    locale: Locale;
};

class SendEmailChangedAuditJob extends BaseJob<EmailChangedAuditData> {
    static jobName = JOB_NAMES.SEND_EMAIL_CHANGED_AUDIT;
    static queueName = QUEUE_NAMES.EMAILS;
    static queueOptions = QUEUE_OPTIONS;

    async handle(job: Job<EmailChangedAuditData>) {
        const { toOld, toNew, locale } = job.data;

        const { subject, html } = createTemplate(
            emailChangedAuditTpl,
            locale,
            toOld.name,
            toNew.address
        );

        for (const to of [toOld, toNew]) {
            log.trace('handle - sending email changed audit', to);

            await mailClient.send({
                from: { name: FROM_NAME, address: FROM_ADDRESS },
                to,
                subject,
                html
            });
        }

        log.notice('email changed audit sent', {
            old: toOld.address,
            new: toNew.address
        });
    }
}

queueManager.registerJob(new SendEmailChangedAuditJob().getDefinition());
