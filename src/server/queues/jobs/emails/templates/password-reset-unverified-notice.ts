import type { MailTemplate } from '@/server/queues/jobs/emails/utils';

export const passwordResetUnverifiedNoticeTpl: MailTemplate<[string, string]> =
    {
        subject: 'K vaší žádosti o obnovení hesla',
        body: (username, verifyLink) => `
<!DOCTYPE html>
<html>
    <head>
        <title>K vaší žádosti o obnovení hesla</title>
    </head>
    <body>
        <p>Ahoj ${username},</p>
        <p>Obdrželi jsme žádost o obnovení hesla k vašemu účtu na <strong>Cookhound.com</strong>.</p>
        <p>Než si budete moci obnovit heslo, potřebujeme ověřit vaši e-mailovou adresu. Nejprve prosím ověřte svůj e-mail &mdash; nový ověřovací odkaz si můžete vyžádat zde:</p>
        <p><a href="${verifyLink}">Ověřit e-mail</a></p>
        <p>Jakmile bude váš e-mail ověřen, vraťte se na přihlašovací stránku a znovu použijte možnost „Zapomněli jste heslo?“.</p>
        <p>Pokud jste o obnovení hesla nežádali, ignorujte prosím tento e-mail nebo nás kontaktujte, pokud máte obavy o bezpečnost svého účtu.</p>
        <p>Přejeme příjemné vaření,<br/>Tým Cookhound 🐾</p>
    </body>
</html>`
    };
