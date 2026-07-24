import {
    escapeHtml,
    type MailTemplate
} from '@/server/queues/jobs/emails/utils';

export const adminReportNotificationTpl: MailTemplate<
    [
        reportId: number,
        targetType: string,
        targetLabel: string,
        targetUrl: string,
        reason: string,
        details: string,
        reporterId: number
    ]
> = {
    subject: 'Nové hlášení obsahu - Cookhound.com',
    body: (
        reportId,
        targetType,
        targetLabel,
        targetUrl,
        reason,
        details,
        reporterId
    ) => `
<!DOCTYPE html>
<html>
    <head>
        <title>Nové hlášení obsahu</title>
    </head>
    <body>
        <h2>Nové hlášení obsahu</h2>
        <p>Uživatel nahlásil obsah k posouzení.</p>
        <table>
            <tr><td><strong>ID hlášení:</strong></td><td>${reportId}</td></tr>
            <tr><td><strong>Typ obsahu:</strong></td><td>${escapeHtml(targetType)}</td></tr>
            <tr><td><strong>Obsah:</strong></td><td>${escapeHtml(targetLabel)}</td></tr>
            <tr><td><strong>URL:</strong></td><td>${escapeHtml(targetUrl)}</td></tr>
            <tr><td><strong>Důvod:</strong></td><td>${escapeHtml(reason)}</td></tr>
            <tr><td><strong>ID nahlašovatele:</strong></td><td>${reporterId}</td></tr>
        </table>
        ${
            details
                ? `<hr /><p><strong>Popis od nahlašovatele:</strong></p>
                   <p>${escapeHtml(details).replace(/\n/g, '<br />')}</p>`
                : ''
        }
    </body>
</html>`
};
