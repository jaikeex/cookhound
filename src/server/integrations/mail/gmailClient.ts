import { gmailService } from '@/server/integrations';
import { Logger } from '@/server/logger';
import { InfrastructureError } from '@/server/error';
import { InfrastructureErrorCode } from '@/server/error/codes';

export interface MailAddress {
    name: string;
    address: string;
}

export interface MailOptions {
    from: MailAddress;
    to: MailAddress | MailAddress[];
    subject: string;
    html: string;
    text?: string;
}

const log = Logger.getInstance('gmail-mail-client');

class GmailMailClient {
    async send(options: MailOptions): Promise<void> {
        try {
            const to = Array.isArray(options.to)
                ? options.to.map((t) => `${t.name} <${t.address}>`).join(', ')
                : `${options.to.name} <${options.to.address}>`;

            await gmailService.sendMail({
                from: `${options.from.name} <${options.from.address}>`,
                to,
                subject: options.subject,
                html: options.html,
                text: options.text ?? ''
            });
        } catch (error: unknown) {
            log.errorWithStack('send - failed to send via Gmail API', error);
            throw new InfrastructureError(
                InfrastructureErrorCode.SMTP_SEND_FAILED // reuse code
            );
        }
    }
}

const gmailClient = new GmailMailClient();
export default gmailClient;
