import type { MailTemplate } from '@/server/queues/jobs/emails/utils';

export const passwordResetGoogleNoticeTpl: MailTemplate<[string, string]> = {
    subject: 'K vaší žádosti o obnovení hesla',
    body: (username, loginLink) => `
<!DOCTYPE html>
<html>
    <head>
        <title>K vaší žádosti o obnovení hesla</title>
    </head>
    <body>
        <p>Ahoj ${username},</p>
        <p>Obdrželi jsme žádost o obnovení hesla k vašemu účtu na <strong>Cookhound.com</strong>.</p>
        <p>Váš účet používá <strong>přihlášení přes Google</strong>, takže žádné heslo k obnovení nemáme. Pro návrat do vaší kuchyně stačí použít tlačítko <em>„Přihlásit se přes Google“</em> na přihlašovací stránce:</p>
        <p><a href="${loginLink}">Přihlásit se do Cookhound</a></p>
        <p>Pokud jste o obnovení hesla nežádali, ignorujte prosím tento e-mail nebo nás kontaktujte, pokud máte obavy o bezpečnost svého účtu.</p>
        <p>Přejeme příjemné vaření,<br/>Tým Cookhound 🐾</p>
    </body>
</html>`
};
