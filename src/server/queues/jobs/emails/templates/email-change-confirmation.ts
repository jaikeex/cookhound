import type { MailTemplate } from '@/server/queues/jobs/emails/utils';

export const emailChangeConfirmationTpl: MailTemplate<[string, string]> = {
    subject: {
        en: 'Confirm your new email address',
        cs: 'Potvrďte svou novou e-mailovou adresu'
    },
    body: {
        //|-------------------------------------------------------------------------------------|//
        //?                                         CS                                          ?//
        //|-------------------------------------------------------------------------------------|//

        cs: (username, confirmationLink) => `
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
</html>`,

        //|-------------------------------------------------------------------------------------|//
        //?                                         EN                                          ?//
        //|-------------------------------------------------------------------------------------|//

        en: (username, confirmationLink) => `
<!DOCTYPE html>
<html>
    <head>
        <title>Confirm your new email address</title>
    </head>
    <body>
        <p>Hi ${username},</p>
        <p>We received a request to change the email address associated with your Cookhound account.</p>
        <p>Please confirm this change by clicking the link below:</p>
        <p><a href="${confirmationLink}">Confirm my new email</a></p>
        <p>If you didn't request this change, you can safely ignore this email – your address will remain unchanged.</p>
        <p>Thanks,<br/>The Cookhound Team 🐾</p>
    </body>
</html>`
    }
};
