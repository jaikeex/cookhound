import type { MailTemplate } from '@/server/queues/jobs/emails/utils';

export const emailChangeNoticeTpl: MailTemplate<[string]> = {
    subject: {
        en: 'Email change requested',
        cs: 'Požadavek na změnu e-mailu'
    },
    body: {
        en: (username) => `
<!DOCTYPE html>
<html>
    <head>
        <title>Email change requested</title>
    </head>
    <body>
        <p>Hi ${username},</p>
        <p>Someone (hopefully you) just requested to change the email address on your Cookhound account.</p>
        <p>If this was you, please check the inbox of your new address and follow the confirmation link.</p>
        <p>If you didn't make this request, you can ignore this message, or reset your password to secure your account.</p>
        <p>Best,<br/>The Cookhound Team 🐾</p>
    </body>
</html>`,
        cs: (username) => `
<!DOCTYPE html>
<html>
    <head>
        <title>Požadavek na změnu e-mailu</title>
    </head>
    <body>
        <p>Ahoj ${username},</p>
        <p>Někdo (snad vy) právě požádal o změnu e-mailové adresy na vašem účtu Cookhound.</p>
        <p>Pokud jste to byli vy, zkontrolujte prosím schránku své nové adresy a postupujte podle potvrzovacího odkazu.</p>
        <p>Pokud jste tento požadavek nevytvořili, můžete tuto zprávu ignorovat, nebo si obnovit heslo a zajistit tak svůj účet.</p>
        <p>S pozdravem,<br/>Tým Cookhound 🐾</p>
    </body>
</html>`
    }
};
