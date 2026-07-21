import type { MailTemplate } from '@/server/queues/jobs/emails/utils';

export const accountDeletionReminderTpl: MailTemplate<
    [string, number, string]
> = {
    subject: 'Připomínka: Váš účet bude brzy smazán - Cookhound.com',
    body: (username, daysRemaining, scheduledDate) => `
<!DOCTYPE html>
<html>
    <head>
        <title>Připomínka mazání účtu</title>
    </head>
    <body>
        <p>Ahoj ${username},</p>
        <p>Toto je přátelská připomínka, že váš účet na Cookhound je naplánován ke smazání.</p>
        <p><strong>Zbývající dny: ${daysRemaining}</strong></p>
        <p><strong>Plánované datum smazání: ${scheduledDate}</strong></p>
        <p>Pokud jste si to rozmysleli a chcete si účet ponechat, můžete mazání zrušit:</p>
        <ol>
            <li>Přihlášením do účtu na Cookhound</li>
            <li>Přechodem do nastavení profilu</li>
            <li>Kliknutím na tlačítko "Zrušit mazání"</li>
        </ol>
        <p>Po ${scheduledDate} bude váš účet trvale smazán a nelze jej obnovit.</p>
        <p>Máte-li jakékoli otázky, neváhejte nás kontaktovat na support@cookhound.com</p>
        <p>S pozdravem,<br/>Tým Cookhound 🐾</p>
    </body>
</html>`
};
