import type { MailTemplate } from '@/server/queues/jobs/emails/utils';

export const emailChangeConfirmationTpl: MailTemplate<[string, string]> = {
    subject: 'Potvrďte svou novou e-mailovou adresu',
    body: (username, confirmationLink) => `
<!DOCTYPE html>
<html>
    <head>
        <title>Potvrďte svou novou e-mailovou adresu</title>
    </head>
    <body>
        <p>Ahoj ${username},</p>
        <p>Obdrželi jsme žádost o změnu e-mailové adresy spojené s vaším účtem Cookhound.</p>
        <p>Tuto změnu potvrďte kliknutím na odkaz níže:</p>
        <p><a href="${confirmationLink}">Potvrdit novou adresu</a></p>
        <p>Pokud jste o změnu nežádali, můžete tento e-mail ignorovat – vaše původní adresa zůstane zachována.</p>
        <p>Děkujeme,<br/>Tým Cookhound 🐾</p>
    </body>
</html>`
};
