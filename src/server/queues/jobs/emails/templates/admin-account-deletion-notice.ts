import { ENV_CONFIG_PUBLIC, ROUTES } from '@/common/constants';
import type { MailTemplate } from '@/server/queues/jobs/emails/utils';

const contactLink = `${ENV_CONFIG_PUBLIC.ORIGIN}${ROUTES.contact}`;

export const adminAccountDeletionNoticeTpl: MailTemplate<[string, string]> = {
    subject: 'Váš účet byl naplánován ke smazání - Cookhound.com',
    body: (username, scheduledDate) => `
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
        <p>Pokud se domníváte, že se jedná o chybu, kontaktujte nás prosím prostřednictvím naší <a href="${contactLink}">kontaktní stránky</a>.</p>
        <p>S pozdravem,<br/>Tým Cookhound</p>
    </body>
</html>`
};
