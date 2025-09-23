import type { MailTemplate } from '@/server/queues/jobs/emails/utils';

export const emailVerificationTpl: MailTemplate<[string, string]> = {
    subject: {
        en: 'Welcome to Cookhound.com!',
        cs: 'Vítejte na Cookhound.com!'
    },
    body: {
        en: (username, verificationLink) => `
<!DOCTYPE html>
<html>
    <head>
        <title>Welcome to Cookhound.com!</title>
    </head>
    <body>
        <p>Hi ${username},</p>
        <p>Welcome to <strong>Cookhound.com</strong>, where flavors meet and culinary dreams come to life! 🌟 </p>
        <p>Before you tie your apron and sharpen your knives, there's just one small step we need you to take:</p>
        <p>Please verify your email address by clicking on the link below.</p>
        <p><a href="${verificationLink}">Verify My Email</a></p>
        <p>Once you’re verified, you’re ready to explore, create, and share your delicious dishes with the world. Get ready to inspire and be inspired!</p>
        <p>If you have any questions or stumble upon any recipe for disaster, feel free to reach out to us at support@cookhound.com</p>
        <p>Bon Appétit and Happy Cooking!<br/>The Cookhound Team 🐾</p>
        <p>P.S. If you didn’t sign up for Cookhound.com, you can safely ignore this email. But, you’ll be missing out on some seriously tasty treats!</p>
    </body>
</html>`,
        cs: (username, verificationLink) => `
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
    }
};
