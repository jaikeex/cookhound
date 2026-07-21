import type { MailTemplate } from '@/server/queues/jobs/emails/utils';

export const accountDeletedTpl: MailTemplate<[string]> = {
    subject: 'Váš účet byl smazán - Cookhound.com',
    body: (username) => `
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
};
