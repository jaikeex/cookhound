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
    subject: 'Soudní proces: odvolání - Cookhound.com',
    body: (
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
        <title>Odvolání proti označení receptu</title>
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
};
