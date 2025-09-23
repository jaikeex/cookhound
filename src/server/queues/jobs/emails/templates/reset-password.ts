import type { MailTemplate } from '@/server/queues/jobs/emails/utils';

export const resetPasswordTpl: MailTemplate<[string, string]> = {
    subject: {
        en: 'Password reset',
        cs: 'Obnovení hesla'
    },
    body: {
        en: (username, resetPasswordLink) => `
<!DOCTYPE html>
<html>
    <head>
        <title>Password reset</title>
    </head>
    <body>
        <p>Hi ${username},</p>
        <p>You've recently requested to reset your password for your account at <strong>Cookhound.com</strong>. No worries, we've got you covered! 🛡️</p>
        <p>To set up a new password, just click on the link below:</p>
        <p><a href="${resetPasswordLink}">Reset My Password</a></p>
        <p>This link will expire in 24 hours for security reasons. If you did not request a password reset, please ignore this email or contact us if you have any concerns about your account's security.</p>
        <p>If you have any issues or need further assistance, our customer service team is here to help and eager to get you back to exploring new recipes and cooking amazing dishes.</p>
        <p>Happy Cooking,<br/>The Cookhound Team 🐾</p>
        <p>P.S. Remember, this link is as perishable as fresh produce! Make sure to use it before it expires.</p>
    </body>
</html>`,
        cs: (username, resetPasswordLink) => `
<!DOCTYPE html>
<html>
    <head>
        <title>Obnovení hesla</title>
    </head>
    <body>
        <p>Ahoj ${username},</p>
        <p>Nedávno jste požádali o obnovení hesla k vašemu účtu na <strong>Cookhound.com</strong>. Žádný strach, pomůžeme vám! 🛡️</p>
        <p>Chcete-li si nastavit nové heslo, klikněte prosím na odkaz níže:</p>
        <p><a href="${resetPasswordLink}">Obnovit heslo</a></p>
        <p>Tento odkaz vyprší za 24 hodin z bezpečnostních důvodů. Pokud jste o obnovení hesla nepožádali, ignorujte prosím tento e-mail nebo nás kontaktujte, pokud máte obavy o bezpečnost svého účtu.</p>
        <p>Pokud narazíte na jakékoli problémy nebo potřebujete další pomoc, jsme tu pro vás a rádi vám pomůžeme vrátit se k objevování nových receptů a vaření úžasných jídel.</p>
        <p>Přejeme příjemné vaření,<br/>Tým Cookhound 🐾</p>
        <p>P.S. Nezapomeňte, že tento odkaz má podobnou trvanlivost jako čerstvé suroviny! Ujistěte se, že jej použijete, než vyprší.</p>
    </body>
</html>`
    }
};
