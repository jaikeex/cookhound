import { Logger } from '@/server/logger';

//|=============================================================================================|//

const log = Logger.getInstance('noop-mail-client');

//~=============================================================================================~//
//$                                            TYPES                                            $//
//~=============================================================================================~//

interface MailAddress {
    name: string;
    address: string;
}

interface MailOptions {
    from: MailAddress;
    to: MailAddress;
    subject: string;
    html: string;
}

//~=============================================================================================~//
//$                                            CLASS                                            $//
//~=============================================================================================~//

/**
 * A no-op mail client for E2E testing that logs email details without sending them.
 */
export class NoopMailClient {
    public async send(options: MailOptions): Promise<void> {
        log.info('send - email simulated (E2E test mode)', {
            from: options.from.address,
            to: options.to.address,
            subject: options.subject
        });

        // Simulate a slight delay to mimic real email sending
        await new Promise((resolve) => setTimeout(resolve, 10));
    }
}

const noopMailClient = new NoopMailClient();
export default noopMailClient;
