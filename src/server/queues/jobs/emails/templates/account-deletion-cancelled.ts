import type { MailTemplate } from '@/server/queues/jobs/emails/utils';

export const accountDeletionCancelledTpl: MailTemplate<[string]> = {
    subject: 'Mazání účtu zrušeno - Vítejte zpět! - Cookhound.com',
    body: (username) => `
<!DOCTYPE html>
<html>
    <head>
        <title>Mazání účtu zrušeno</title>
    </head>
    <body>
        <p>Ahoj ${username},</p>
        <p>Skvělé zprávy! Mazání vašeho účtu bylo úspěšně zrušeno. Jsme rádi, že jste zpět! 🎉</p>
        <p>Váš účet je opět plně aktivní a můžete pokračovat v užívání všech funkcí Cookhound:</p>
        <ul>
            <li>Vytvářet a sdílet lahodné recepty</li>
            <li>Budovat své kuchařské sbírky</li>
            <li>Spojit se s dalšími gurmány</li>
            <li>Objevovat nová kulinářská dobrodružství</li>
        </ul>
        <p>Pokud jste toto mazání nezrušili, prosím zabezpečte svůj účet okamžitě a kontaktujte nás na support@cookhound.com.</p>
        <p>Příjemné vaření!<br/>Tým Cookhound 🐾</p>
    </body>
</html>`
};
