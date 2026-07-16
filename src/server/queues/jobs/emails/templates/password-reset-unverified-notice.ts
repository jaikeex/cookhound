import type { MailTemplate } from '@/server/queues/jobs/emails/utils';

export const passwordResetUnverifiedNoticeTpl: MailTemplate<[string, string]> =
    {
        subject: {
            en: 'About your password reset request',
            cs: 'K vaší žádosti o obnovení hesla'
        },
        body: {
            en: (username, verifyLink) => `
<!DOCTYPE html>
<html>
    <head>
        <title>About your password reset request</title>
    </head>
    <body>
        <p>Hi ${username},</p>
        <p>We received a request to reset the password for your <strong>Cookhound.com</strong> account.</p>
        <p>Before you can reset your password, we need to confirm your email address. Please verify your email first &mdash; you can request a fresh verification link here:</p>
        <p><a href="${verifyLink}">Verify my email</a></p>
        <p>Once your email is verified, head back to the login page and use "Forgot your password?" again.</p>
        <p>If you did not request a password reset, please ignore this email or contact us if you have any concerns about your account's security.</p>
        <p>Happy Cooking,<br/>The Cookhound Team 🐾</p>
    </body>
</html>`,
            cs: (username, verifyLink) => `
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
        }
    };
