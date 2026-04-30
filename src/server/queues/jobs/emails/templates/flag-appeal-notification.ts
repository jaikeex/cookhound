import {
    escapeHtml,
    type MailTemplate
} from '@/server/queues/jobs/emails/utils';

export const flagAppealNotificationTpl: MailTemplate<
    [
        appealId: number,
        flagId: number,
        flagReason: string,
        recipeId: number,
        recipeDisplayId: string,
        recipeTitle: string,
        authorId: number,
        message: string
    ]
> = {
    subject: {
        en: 'Recipe flag appeal submitted - Cookhound.com',
        cs: 'Soudní proces: odvolání - Cookhound.com'
    },
    body: {
        en: (
            appealId,
            flagId,
            flagReason,
            recipeId,
            recipeDisplayId,
            recipeTitle,
            authorId,
            message
        ) => `
<!DOCTYPE html>
<html>
    <head>
        <title>Recipe Flag Appeal Submitted</title>
    </head>
    <body>
        <h2>Recipe Flag Appeal Submitted</h2>
        <p>An author has contested the automated flag on their recipe.</p>
        <table>
            <tr><td><strong>Appeal ID:</strong></td><td>${appealId}</td></tr>
            <tr><td><strong>Flag ID:</strong></td><td>${flagId}</td></tr>
            <tr><td><strong>Flag reason:</strong></td><td>${escapeHtml(flagReason)}</td></tr>
            <tr><td><strong>Recipe:</strong></td><td>${escapeHtml(recipeTitle)} (internal id: ${recipeId}, display id ${escapeHtml(recipeDisplayId)})</td></tr>
            <tr><td><strong>Author user id:</strong></td><td>${authorId}</td></tr>
        </table>
        <hr />
        <p><strong>Author's message:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, '<br />')}</p>
    </body>
</html>`,
        cs: (
            appealId,
            flagId,
            flagReason,
            recipeId,
            recipeDisplayId,
            recipeTitle,
            authorId,
            message
        ) => `
<!DOCTYPE html>
<html>
    <head>
        <title></title>
    </head>
    <body>
        <h2>Odvolání proti označení receptu</h2>
        <p>Autor receptu se odvolal proti automatickému označení svého receptu.</p>
        <table>
            <tr><td><strong>ID odvolání:</strong></td><td>${appealId}</td></tr>
            <tr><td><strong>ID označení:</strong></td><td>${flagId}</td></tr>
            <tr><td><strong>Důvod označení:</strong></td><td>${escapeHtml(flagReason)}</td></tr>
            <tr><td><strong>Recept:</strong></td><td>${escapeHtml(recipeTitle)} (id ${recipeId}, displayId ${escapeHtml(recipeDisplayId)})</td></tr>
            <tr><td><strong>ID autora:</strong></td><td>${authorId}</td></tr>
        </table>
        <hr />
        <p><strong>Zpráva autora:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, '<br />')}</p>
    </body>
</html>`
    }
};
