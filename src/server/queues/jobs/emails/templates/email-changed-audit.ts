import type { MailTemplate } from '@/server/queues/jobs/emails/utils';

export const emailChangedAuditTpl: MailTemplate<[string, string]> = {
    subject: {
        en: 'Your email was changed',
        cs: 'Váš e-mail byl změněn'
    },
    body: {
        en: (username, newEmail) => `
<!DOCTYPE html>
<html>
    <head>
        <title>Your email was changed</title>
    </head>
    <body>
        <p>Hi ${username},</p>
        <p>This is a confirmation that the email address on your Cookhound account was successfully changed to ${newEmail}.</p>
        <p>If you did not perform this action, please contact support immediately.</p>
        <p>Bon Appétit!<br/>The Cookhound Team 🐾</p>
    </body>
</html>`,
        cs: (username, newEmail) => `
<!DOCTYPE html>
<html>
    <head>
        <title>Váš e-mail byl změněn</title>
    </head>
    <body>
        <p>Ahoj ${username},</p>
        <p>Toto je potvrzení, že e-mailová adresa na vašem účtu Cookhound byla úspěšně změněna na ${newEmail}.</p>
        <p>Pokud jste tuto akci neprovedli vy, okamžitě nás prosím kontaktujte.</p>
        <p>Dobrou chuť!<br/>Tým Cookhound 🐾</p>
    </body>
</html>`
    }
};
