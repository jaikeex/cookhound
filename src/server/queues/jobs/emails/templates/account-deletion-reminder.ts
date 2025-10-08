import type { MailTemplate } from '@/server/queues/jobs/emails/utils';

export const accountDeletionReminderTpl: MailTemplate<
    [string, number, string]
> = {
    subject: {
        en: 'Reminder: Your Account Will Be Deleted Soon - Cookhound.com',
        cs: 'Připomínka: Váš účet bude brzy smazán - Cookhound.com'
    },
    body: {
        en: (username, daysRemaining, scheduledDate) => `
<!DOCTYPE html>
<html>
    <head>
        <title>Account Deletion Reminder</title>
    </head>
    <body>
        <p>Hi ${username},</p>
        <p>This is a friendly reminder that your Cookhound account is scheduled for deletion.</p>
        <p><strong>Days remaining: ${daysRemaining}</strong></p>
        <p><strong>Scheduled deletion date: ${scheduledDate}</strong></p>
        <p>If you've changed your mind and want to keep your account, you can cancel the deletion by:</p>
        <ol>
            <li>Logging into your Cookhound account</li>
            <li>Going to your profile settings</li>
            <li>Clicking the "Cancel Deletion" button</li>
        </ol>
        <p>After ${scheduledDate}, your account will be permanently deleted and cannot be recovered.</p>
        <p>If you have any questions, feel free to reach out to us at support@cookhound.com</p>
        <p>Best regards,<br/>The Cookhound Team 🐾</p>
    </body>
</html>`,
        cs: (username, daysRemaining, scheduledDate) => `
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
    }
};
