import { mailClient } from '@/server/integrations';
import { BaseJob } from '@/server/queues/BaseJob';
import type { Job } from 'bullmq';
import { ENV_CONFIG_PUBLIC } from '@/common/constants';
import { Logger } from '@/server/logger';
import { queueManager } from '@/server/queues/QueueManager';
import { JOB_NAMES, QUEUE_NAMES } from '@/server/queues/jobs/names';
import { FROM_ADDRESS, FROM_NAME, QUEUE_OPTIONS } from './constants';
import { resetPasswordTemplate } from './templates/reset-password';

const log = Logger.getInstance('password-reset-email-worker');

type PasswordResetEmailJobData = {
    token: string;
    to: { address: string; name: string };
};

class SendPasswordResetEmailJob extends BaseJob<PasswordResetEmailJobData> {
    static jobName = JOB_NAMES.SEND_PASSWORD_RESET_EMAIL;
    static queueName = QUEUE_NAMES.EMAILS;
    static queueOptions = QUEUE_OPTIONS;

    async handle(job: Job<PasswordResetEmailJobData>) {
        const { token, to } = job.data;

        log.trace('handle - attempting to send password reset email', to);

        const reset_link = `${ENV_CONFIG_PUBLIC.ORIGIN}/auth/callback/reset-password?token=${token}`;
        const html = resetPasswordTemplate(to.name, reset_link);

        await mailClient.send({
            from: {
                name: FROM_NAME,
                address: FROM_ADDRESS
            },
            subject: 'Password reset',
            to,
            html
        });

        log.info('password reset email sent', to);
    }
}

queueManager.registerJob(new SendPasswordResetEmailJob().getDefinition());
