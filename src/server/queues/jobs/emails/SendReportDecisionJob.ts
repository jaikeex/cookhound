import { mailClient } from '@/server/integrations';
import { BaseJob } from '@/server/queues/BaseJob';
import type { Job } from 'bullmq';
import { reportDecisionTpl } from './templates/report-decision';
import { createTemplate } from './utils';
import { Logger } from '@/server/logger';
import { queueManager } from '@/server/queues/QueueManager';
import { JOB_NAMES, QUEUE_NAMES } from '@/server/queues/jobs/names';
import { FROM_ADDRESS, FROM_NAME, QUEUE_OPTIONS } from './constants';

const log = Logger.getInstance('report-decision-worker');

type ReportDecisionJobData = {
    targetLabel: string;
    upheld: boolean;
    resolution: string;
    to: { address: string; name: string };
};

class SendReportDecisionJob extends BaseJob<ReportDecisionJobData> {
    static jobName = JOB_NAMES.SEND_REPORT_DECISION;
    static queueName = QUEUE_NAMES.EMAILS;
    static queueOptions = QUEUE_OPTIONS;

    async handle(job: Job<ReportDecisionJobData>) {
        const { targetLabel, upheld, resolution, to } = job.data;

        log.trace('handle - sending report decision', to);

        const { subject, html } = createTemplate(
            reportDecisionTpl,
            to.name,
            targetLabel,
            upheld,
            resolution
        );

        await mailClient.send({
            from: { name: FROM_NAME, address: FROM_ADDRESS },
            to,
            subject,
            html
        });

        log.notice('report decision email sent', to);
    }
}

queueManager.registerJob(new SendReportDecisionJob().getDefinition());
