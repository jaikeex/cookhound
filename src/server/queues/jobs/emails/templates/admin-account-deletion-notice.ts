import type { MailTemplate } from '@/server/queues/jobs/emails/utils';

export const adminAccountDeletionNoticeTpl: MailTemplate<[string, string]> = {
    subject: {
        en: 'Your Account Has Been Scheduled for Deletion - Cookhound.com',
        cs: 'Váš účet byl naplánován ke smazání - Cookhound.com'
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
        <p>We're writing to let you know that an administrator has scheduled your cookhound.com account for deletion.</p>
        <p><strong>Your account is scheduled for permanent deletion on ${scheduledDate}.</strong></p>
        <p>After that date, your account and associated data will be permanently removed. Your recipes will be preserved and anonymized.</p>
        <p>If you believe this is a mistake, please reach out to us through our <a href="https://cookhound.com/contact">contact page</a>.</p>
        <p>Best regards,<br/>The Cookhound Team</p>
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
        <p>Rádi bychom vás informovali, že administrátor naplánoval smazání vašeho účtu na cookhound.com.</p>
        <p><strong>Váš účet je naplánován k trvalému smazání dne ${scheduledDate}.</strong></p>
        <p>Po tomto datu bude váš účet a související data trvale odstraněny. Vaše recepty budou zachovány a anonymizovány.</p>
        <p>Pokud se domníváte, že se jedná o chybu, kontaktujte nás prosím prostřednictvím naší <a href="https://cookhound.com/contact">kontaktní stránky</a>.</p>
        <p>S pozdravem,<br/>Tým Cookhound</p>
    </body>
</html>`
    }
};
