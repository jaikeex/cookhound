import { Logger } from '@/server/logger';
import { queueManager } from '@/server/queues/QueueManager';
import { JOB_NAMES } from '@/server/queues/jobs/names';

//|=============================================================================================|//

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
    async sendEmailVerification(
        email: string,
        username: string,
        token: string
    ) {
        log.trace('queueing verification email', { email, username });

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
    async sendPasswordReset(email: string, username: string, token: string) {
        log.trace('queueing password reset email', {
            email,
            username
        });

        await queueManager.addJob(JOB_NAMES.SEND_PASSWORD_RESET_EMAIL, {
            token,
            to: { name: username, address: email }
        });

        return;
    }
}

export const mailService = new MailService();
