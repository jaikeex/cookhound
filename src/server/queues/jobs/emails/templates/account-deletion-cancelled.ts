import type { MailTemplate } from '@/server/queues/jobs/emails/utils';

export const accountDeletionCancelledTpl: MailTemplate<[string]> = {
    subject: {
        en: 'Account Deletion Cancelled - Welcome Back! - Cookhound.com',
        cs: 'Mazání účtu zrušeno - Vítejte zpět! - Cookhound.com'
    },
    body: {
        en: (username) => `
<!DOCTYPE html>
<html>
    <head>
        <title>Account Deletion Cancelled</title>
    </head>
    <body>
        <p>Hi ${username},</p>
        <p>Great news! Your account deletion has been successfully cancelled. We're thrilled to have you back! 🎉</p>
        <p>Your account is now fully active again, and you can continue enjoying all the features of Cookhound:</p>
        <ul>
            <li>Create and share delicious recipes</li>
            <li>Build your cookbook collections</li>
            <li>Connect with fellow food enthusiasts</li>
            <li>Discover new culinary adventures</li>
        </ul>
        <p>If you didn't cancel this deletion, please secure your account immediately and contact us at support@cookhound.com.</p>
        <p>Happy cooking!<br/>The Cookhound Team 🐾</p>
    </body>
</html>`,
        cs: (username) => `
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
    }
};
