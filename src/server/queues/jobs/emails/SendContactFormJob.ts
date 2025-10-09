import { mailClient } from '@/server/integrations';
import { BaseJob } from '@/server/queues/BaseJob';
import type { Job } from 'bullmq';
import { queueManager } from '@/server/queues/QueueManager';
import { JOB_NAMES, QUEUE_NAMES } from '@/server/queues/jobs/names';
import { FROM_ADDRESS, QUEUE_OPTIONS } from './constants';
import { Logger } from '@/server/logger';
import { contactFormTpl } from './templates/contact-form';
import type { Locale } from '@/common/types';
import { createTemplate } from './utils';
import { ENV_CONFIG_PRIVATE } from '@/common/constants/env';

const log = Logger.getInstance('contact-form-worker');

type ContactFormData = {
    name: string;
    email: string;
    subject: string;
    message: string;
    locale: Locale;
};

class SendContactFormJob extends BaseJob<ContactFormData> {
    static jobName = JOB_NAMES.SEND_CONTACT_FORM;
    static queueName = QUEUE_NAMES.EMAILS;
    static queueOptions = QUEUE_OPTIONS;

    async handle(job: Job<ContactFormData>) {
        const { name, email, subject, message, locale } = job.data;

        log.trace('handle - sending contact form submission', {
            name,
            email,
            subject
        });

        const { html } = createTemplate(
            contactFormTpl,
            locale,
            name,
            email,
            subject,
            message
        );

        // Send email to support team
        await mailClient.send({
            from: { name: 'Cookhound Contact Form', address: FROM_ADDRESS },
            to: {
                name: 'Cookhound Support',
                address: ENV_CONFIG_PRIVATE.CONTACT_EMAIL
            },
            subject: `Contact Form: ${subject}`,
            html,
            text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`
        });

        log.notice('contact form email sent', { name, email, subject });
    }
}

queueManager.registerJob(new SendContactFormJob().getDefinition());
