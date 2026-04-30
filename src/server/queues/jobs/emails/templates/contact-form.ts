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
    subject: {
        en: 'Contact Form Submission - Cookhound.com',
        cs: 'Contact Form Submission - Cookhound.com'
    },
    body: {
        en: (name, email, subject, message) => `
<!DOCTYPE html>
<html>
    <head>
        <title>Contact Form Submission</title>
    </head>
    <body>
        <h2>Contact Form Submission</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
        <hr />
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, '<br />')}</p>
    </body>
</html>`,
        cs: (name, email, subject, message) => `
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
    }
};
