import {
    escapeHtml,
    type MailTemplate
} from '@/server/queues/jobs/emails/utils';

/**
 * Statement of reasons sent to a reporter once their report reaches a terminal
 * decision (DSA Art. 16(5) / Art. 17). `upheld` distinguishes an actioned
 * report from a dismissed one; `resolution` is the moderator's free-text note.
 */
export const reportDecisionTpl: MailTemplate<
    [username: string, targetLabel: string, upheld: boolean, resolution: string]
> = {
    subject: 'Rozhodnutí o vašem hlášení - Cookhound.com',
    body: (username, targetLabel, upheld, resolution) => `
<!DOCTYPE html>
<html>
    <head>
        <title>Rozhodnutí o vašem hlášení</title>
    </head>
    <body>
        <p>Ahoj ${escapeHtml(username)},</p>
        <p>Posoudili jsme vaše hlášení týkající se obsahu
           „${escapeHtml(targetLabel)}".</p>
        <p><strong>Výsledek:</strong> ${
            upheld
                ? 'Hlášení jsme vyhodnotili jako oprávněné a přijali jsme příslušná opatření.'
                : 'Po posouzení jsme nezjistili porušení našich pravidel a obsah zůstává zveřejněn.'
        }</p>
        ${
            resolution
                ? `<hr /><p><strong>Poznámka moderátora:</strong></p>
                   <p>${escapeHtml(resolution).replace(/\n/g, '<br />')}</p>`
                : ''
        }
        <p>Pokud s tímto rozhodnutím nesouhlasíte, můžete nás kontaktovat na
           support@cookhound.com.</p>
        <p>S pozdravem,<br/>Tým Cookhound 🐾</p>
    </body>
</html>`
};
