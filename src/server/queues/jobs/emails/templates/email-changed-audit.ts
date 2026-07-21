import type { MailTemplate } from '@/server/queues/jobs/emails/utils';

export const emailChangedAuditTpl: MailTemplate<[string, string]> = {
    subject: 'Váš e-mail byl změněn',
    body: (username, newEmail) => `
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
};
