import {
    escapeHtml,
    type MailTemplate
} from '@/server/queues/jobs/emails/utils';

/**
 * Confirmation of receipt sent to a reporter immediately after they file a
 * report (DSA Art. 16(4)).
 */
export const reportReceiptTpl: MailTemplate<
    [username: string, targetLabel: string]
> = {
    subject: 'Potvrzení přijetí hlášení - Cookhound.com',
    body: (username, targetLabel) => `
<!DOCTYPE html>
<html>
    <head>
        <title>Přijali jsme vaše hlášení</title>
    </head>
    <body>
        <p>Ahoj ${escapeHtml(username)},</p>
        <p>Děkujeme, že nám pomáháte udržovat Cookhound bezpečný. Přijali jsme
           vaše hlášení týkající se obsahu „${escapeHtml(targetLabel)}".</p>
        <p>Vaše hlášení nyní posoudí náš tým. Jakmile rozhodneme, budeme vás
           informovat e-mailem.</p>
        <p>S pozdravem,<br/>Tým Cookhound 🐾</p>
    </body>
</html>`
};
