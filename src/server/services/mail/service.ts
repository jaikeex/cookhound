import { Logger, LogServiceMethod } from '@/server/logger';
import { queueManager } from '@/server/queues/QueueManager';
import { JOB_NAMES } from '@/server/queues/jobs/names';

//|=============================================================================================|//

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const log = Logger.getInstance('mail-service');

/**
 * Service class for sending emails.
 * It provides methods for sending different types of emails, such as verification emails.
 */
class MailService {
    /**
     * Sends an email verification link to a user.
     *
     * @param email - The recipient's email address.
     * @param username - The recipient's username.
     * @param token - The verification token.
     */
    @LogServiceMethod({ names: ['email', 'username', 'token'] })
    async sendEmailVerification(
        email: string,
        username: string,
        token: string
    ) {
        await queueManager.addJob(JOB_NAMES.SEND_VERIFICATION_EMAIL, {
            token,
            to: { name: username, address: email }
        });

        return;
    }

    /**
     * Sends an email verification link to a user.
     *
     * @param email - The recipient's email address.
     * @param username - The recipient's username.
     * @param token - The verification token.
     */
    @LogServiceMethod({ names: ['email', 'username', 'token'] })
    async sendPasswordReset(email: string, username: string, token: string) {
        await queueManager.addJob(JOB_NAMES.SEND_PASSWORD_RESET_EMAIL, {
            token,
            to: { name: username, address: email }
        });

        return;
    }

    @LogServiceMethod({ names: ['email', 'username', 'token'] })
    async sendEmailChangeConfirmation(
        email: string,
        token: string,
        username: string
    ) {
        await queueManager.addJob(JOB_NAMES.SEND_EMAIL_CHANGE_CONFIRMATION, {
            token,
            to: { name: username, address: email }
        });
    }

    @LogServiceMethod({ names: ['email', 'username'] })
    async sendEmailChangeNotice(email: string, username: string) {
        await queueManager.addJob(JOB_NAMES.SEND_EMAIL_CHANGE_NOTICE, {
            to: { name: username, address: email }
        });
    }

    @LogServiceMethod({ names: ['oldEmail', 'newEmail', 'username'] })
    async sendEmailChangedAudit(
        oldEmail: string,
        newEmail: string,
        username: string
    ) {
        await queueManager.addJob(JOB_NAMES.SEND_EMAIL_CHANGED_AUDIT, {
            toOld: { name: username, address: oldEmail },
            toNew: { name: username, address: newEmail }
        });
    }
}

export const mailService = new MailService();
