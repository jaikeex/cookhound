import type { MailTemplate } from '@/server/queues/jobs/emails/utils';

export const emailVerificationTpl: MailTemplate<[string, string]> = {
    subject: 'Vítejte na Cookhound.com!',
    body: (username, verificationLink) => `
<!DOCTYPE html>
<html>
    <head>
        <title>Vítejte na Cookhound.com!</title>
    </head>
    <body>
        <p>Ahoj ${username},</p>
        <p>Vítejte na <strong>Cookhound.com</strong>, kde se chutě setkávají a kulinářské sny se mění ve skutečnost! 🌟</p>
        <p>Než si uvážete zástěru a naostříte nože, zbývá už jen jeden malý krok:</p>
        <p>Ověřte svou e-mailovou adresu kliknutím na odkaz níže.</p>
        <p><a href="${verificationLink}">Ověřit e-mail</a></p>
        <p>Jakmile budete ověřeni, můžete objevovat, tvořit a sdílet své lahodné pokrmy se světem. Připravte se inspirovat i být inspirováni!</p>
        <p>Máte-li jakékoli otázky, neváhejte nás kontaktovat na support@cookhound.com.</p>
        <p>Dobrou chuť a příjemné vaření!<br/>Tým Cookhound 🐾</p>
        <p>P.S. Pokud jste se na Cookhound.com neregistrovali, můžete tento e-mail bezpečně ignorovat. Ale přijdete o spoustu chutných dobrot!</p>
    </body>
</html>`
};
