import type { MailTemplate } from '@/server/queues/jobs/emails/utils';

export const resetPasswordTpl: MailTemplate<[string, string]> = {
    subject: 'Obnovení hesla',
    body: (username, resetPasswordLink) => `
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
};
