import { mailClient } from '@/server/integrations';
import { BaseJob } from '@/server/queues/BaseJob';
import type { Job } from 'bullmq';
import { reportReceiptTpl } from './templates/report-receipt';
import { createTemplate } from './utils';
import { Logger } from '@/server/logger';
import { queueManager } from '@/server/queues/QueueManager';
import { JOB_NAMES, QUEUE_NAMES } from '@/server/queues/jobs/names';
import { FROM_ADDRESS, FROM_NAME, QUEUE_OPTIONS } from './constants';

const log = Logger.getInstance('report-receipt-worker');

type ReportReceiptJobData = {
    targetLabel: string;
    to: { address: string; name: string };
};

class SendReportReceiptJob extends BaseJob<ReportReceiptJobData> {
    static jobName = JOB_NAMES.SEND_REPORT_RECEIPT;
    static queueName = QUEUE_NAMES.EMAILS;
    static queueOptions = QUEUE_OPTIONS;

    async handle(job: Job<ReportReceiptJobData>) {
        const { targetLabel, to } = job.data;

        log.trace('handle - sending report receipt', to);

        const { subject, html } = createTemplate(
            reportReceiptTpl,
            to.name,
            targetLabel
        );

        await mailClient.send({
            from: { name: FROM_NAME, address: FROM_ADDRESS },
            to,
            subject,
            html
        });

        log.notice('report receipt email sent', to);
    }
}

queueManager.registerJob(new SendReportReceiptJob().getDefinition());
