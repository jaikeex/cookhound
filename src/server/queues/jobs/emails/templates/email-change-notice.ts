import type { MailTemplate } from '@/server/queues/jobs/emails/utils';

export const emailChangeNoticeTpl: MailTemplate<[string]> = {
    subject: 'Požadavek na změnu e-mailu',
    body: (username) => `
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
};
