import type { MailTemplate } from '@/server/queues/jobs/emails/utils';

export const accountDeletionConfirmationTpl: MailTemplate<[string, string]> = {
    subject: 'Mazání účtu naplánováno - Cookhound.com',
    body: (username, scheduledDate) => `
<!DOCTYPE html>
<html>
    <head>
        <title>Mazání účtu naplánováno</title>
    </head>
    <body>
        <p>Ahoj ${username},</p>
        <p>Obdrželi jsme vaši žádost o smazání účtu na Cookhound. Je nám líto, že odcházíte! 😢</p>
        <p><strong>Váš účet je naplánován ke smazání dne ${scheduledDate}.</strong></p>
        <p>Během následujících 30 dnů:</p>
        <ul>
            <li>Váš účet zůstane přístupný, ale označený ke smazání</li>
            <li>Mazání můžete kdykoli zrušit přihlášením a návštěvou nastavení profilu</li>
            <li>Všechny vaše recepty budou po uplynutí lhůty zachovány a anonymizovány</li>
        </ul>
        <p>Po uplynutí 30denní lhůty bude váš účet trvale smazán. Tuto akci nelze vrátit zpět.</p>
        <p><strong>Změnili jste názor?</strong> Mazání můžete kdykoli zrušit před ${scheduledDate} přihlášením do účtu.</p>
        <p>Pokud jste o smazání nežádali, prosím přihlaste se okamžitě a zabezpečte svůj účet, nebo nás kontaktujte na support@cookhound.com.</p>
        <p>S pozdravem,<br/>Tým Cookhound 🐾</p>
    </body>
</html>`
};
