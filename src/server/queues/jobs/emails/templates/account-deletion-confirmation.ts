import type { MailTemplate } from '@/server/queues/jobs/emails/utils';

export const accountDeletionConfirmationTpl: MailTemplate<[string, string]> = {
    subject: {
        en: 'Account Deletion Scheduled - Cookhound.com',
        cs: 'Mazání účtu naplánováno - Cookhound.com'
    },
    body: {
        en: (username, scheduledDate) => `
<!DOCTYPE html>
<html>
    <head>
        <title>Account Deletion Scheduled</title>
    </head>
    <body>
        <p>Hi ${username},</p>
        <p>We've received your request to delete your Cookhound account. We're sorry to see you go! 😢</p>
        <p><strong>Your account is scheduled for deletion on ${scheduledDate}.</strong></p>
        <p>During the next 30 days:</p>
        <ul>
            <li>Your account will remain accessible but marked for deletion</li>
            <li>You can cancel the deletion at any time by logging in and visiting your profile settings</li>
            <li>All your recipes will be preserved and anonymized after the grace period</li>
        </ul>
        <p>After the 30-day grace period, your account will be permanently deleted. This action cannot be undone.</p>
        <p><strong>Changed your mind?</strong> You can cancel the deletion anytime before ${scheduledDate} by logging into your account.</p>
        <p>If you didn't request this deletion, please log in immediately and secure your account, or contact us at support@cookhound.com.</p>
        <p>Best regards,<br/>The Cookhound Team 🐾</p>
    </body>
</html>`,
        cs: (username, scheduledDate) => `
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
    }
};
