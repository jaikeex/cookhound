import type { MailTemplate } from '@/server/queues/jobs/emails/utils';

export const passwordResetGoogleNoticeTpl: MailTemplate<[string, string]> = {
    subject: {
        en: 'About your password reset request',
        cs: 'K vaší žádosti o obnovení hesla'
    },
    body: {
        en: (username, loginLink) => `
<!DOCTYPE html>
<html>
    <head>
        <title>About your password reset request</title>
    </head>
    <body>
        <p>Hi ${username},</p>
        <p>We received a request to reset the password for your <strong>Cookhound.com</strong> account.</p>
        <p>Your account uses <strong>Google Sign-In</strong>, so there's no password for us to reset. To get back to your kitchen, just use the <em>"Continue with Google"</em> button on the login page:</p>
        <p><a href="${loginLink}">Sign in to Cookhound</a></p>
        <p>If you did not request a password reset, please ignore this email or contact us if you have any concerns about your account's security.</p>
        <p>Happy Cooking,<br/>The Cookhound Team 🐾</p>
    </body>
</html>`,
        cs: (username, loginLink) => `
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
    }
};
