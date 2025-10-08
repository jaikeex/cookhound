import type { MailTemplate } from '@/server/queues/jobs/emails/utils';

export const accountDeletedTpl: MailTemplate<[string]> = {
    subject: {
        en: 'Your Account Has Been Deleted - Cookhound.com',
        cs: 'Váš účet byl smazán - Cookhound.com'
    },
    body: {
        en: (username) => `
<!DOCTYPE html>
<html>
    <head>
        <title>Account Deleted</title>
    </head>
    <body>
        <p>Hi ${username},</p>
        <p>This is to confirm that your Cookhound account has been permanently deleted as requested.</p>
        <p>What has been deleted:</p>
        <ul>
            <li>Your account profile and personal information</li>
            <li>Your saved preferences and settings</li>
            <li>Your cookbooks and saved recipes</li>
            <li>Your ratings and comments</li>
        </ul>
        <p>What has been preserved:</p>
        <ul>
            <li>Your published recipes (now anonymized to preserve community value)</li>
        </ul>
        <p>This deletion is permanent and cannot be undone. If you wish to use Cookhound again in the future, you'll need to create a new account.</p>
        <p>Thank you for being part of our community. We hope to see you again someday! 🍳</p>
        <p>Best regards,<br/>The Cookhound Team 🐾</p>
    </body>
</html>`,
        cs: (username) => `
<!DOCTYPE html>
<html>
    <head>
        <title>Účet smazán</title>
    </head>
    <body>
        <p>Ahoj ${username},</p>
        <p>Tímto potvrzujeme, že váš účet na Cookhound byl trvale smazán podle vaší žádosti.</p>
        <p>Co bylo smazáno:</p>
        <ul>
            <li>Váš účet a osobní údaje</li>
            <li>Vaše uložené preference a nastavení</li>
            <li>Vaše kuchařky a uložené recepty</li>
            <li>Vaše hodnocení a komentáře</li>
        </ul>
        <p>Co bylo zachováno:</p>
        <ul>
            <li>Vaše publikované recepty (nyní anonymizovány pro zachování hodnoty pro komunitu)</li>
        </ul>
        <p>Toto smazání je trvalé a nelze jej vrátit zpět. Pokud budete chtít Cookhound v budoucnu znovu používat, budete si muset vytvořit nový účet.</p>
        <p>Děkujeme, že jste byli součástí naší komunity. Doufáme, že vás někdy zase uvidíme! 🍳</p>
        <p>S pozdravem,<br/>Tým Cookhound 🐾</p>
    </body>
</html>`
    }
};
