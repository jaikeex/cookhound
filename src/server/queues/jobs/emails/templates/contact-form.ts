import {
    escapeHtml,
    type MailTemplate
} from '@/server/queues/jobs/emails/utils';

/**
 * Template for contact form submissions.
 * This email is sent to the support team, not to the user.
 */
export const contactFormTpl: MailTemplate<
    [name: string, email: string, subject: string, message: string]
> = {
    subject: 'Contact Form Submission - Cookhound.com',
    body: (name, email, subject, message) => `
<!DOCTYPE html>
<html>
    <head>
        <title>Odeslaný kontaktní formulář</title>
    </head>
    <body>
        <h2>Odeslaný kontaktní formulář</h2>
        <p><strong>Jméno:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Předmět:</strong> ${escapeHtml(subject)}</p>
        <hr />
        <p><strong>Zpráva:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, '<br />')}</p>
    </body>
</html>`
};
