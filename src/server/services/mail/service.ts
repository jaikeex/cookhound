import { Logger, LogServiceMethod } from '@/server/logger';
import { queueManager } from '@/server/queues/QueueManager';
import { RequestContext } from '@/server/utils/reqwest/context/requestContext';
import { DEFAULT_LOCALE } from '@/common/constants/general';
import { JOB_NAMES } from '@/server/queues/jobs/names';

//|=============================================================================================|//

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const log = Logger.getInstance('mail-service');

/**
 * Service class for sending emails.
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
            to: { name: username, address: email },
            locale: RequestContext.getUserLocale() ?? DEFAULT_LOCALE
        });
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
            to: { name: username, address: email },
            locale: RequestContext.getUserLocale() ?? DEFAULT_LOCALE
        });
    }

    @LogServiceMethod({ names: ['email', 'username', 'token'] })
    async sendEmailChangeConfirmation(
        email: string,
        token: string,
        username: string
    ) {
        await queueManager.addJob(JOB_NAMES.SEND_EMAIL_CHANGE_CONFIRMATION, {
            token,
            to: { name: username, address: email },
            locale: RequestContext.getUserLocale() ?? DEFAULT_LOCALE
        });
    }

    @LogServiceMethod({ names: ['email', 'username'] })
    async sendEmailChangeNotice(email: string, username: string) {
        await queueManager.addJob(JOB_NAMES.SEND_EMAIL_CHANGE_NOTICE, {
            to: { name: username, address: email },
            locale: RequestContext.getUserLocale() ?? DEFAULT_LOCALE
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
            toNew: { name: username, address: newEmail },
            locale: RequestContext.getUserLocale() ?? DEFAULT_LOCALE
        });
    }

    /**
     * Sends an account deletion confirmation email.
     *
     * @param email - The recipient's email address.
     * @param username - The recipient's username.
     * @param scheduledDate - The scheduled deletion date (formatted string).
     */
    @LogServiceMethod({ names: ['email', 'username', 'scheduledDate'] })
    async sendAccountDeletionConfirmation(
        email: string,
        username: string,
        scheduledDate: string
    ) {
        await queueManager.addJob(
            JOB_NAMES.SEND_ACCOUNT_DELETION_CONFIRMATION,
            {
                scheduledDate,
                to: { name: username, address: email },
                locale: RequestContext.getUserLocale() ?? DEFAULT_LOCALE
            }
        );
    }

    /**
     * Sends an account deletion reminder email.
     *
     * @param email - The recipient's email address.
     * @param username - The recipient's username.
     * @param daysRemaining - Days remaining until deletion.
     * @param scheduledDate - The scheduled deletion date (formatted string).
     */
    @LogServiceMethod({
        names: ['email', 'username', 'daysRemaining', 'scheduledDate']
    })
    async sendAccountDeletionReminder(
        email: string,
        username: string,
        daysRemaining: number,
        scheduledDate: string
    ) {
        await queueManager.addJob(JOB_NAMES.SEND_ACCOUNT_DELETION_REMINDER, {
            daysRemaining,
            scheduledDate,
            to: { name: username, address: email },
            locale: RequestContext.getUserLocale() ?? DEFAULT_LOCALE
        });
    }

    /**
     * Sends an account deletion cancelled email.
     *
     * @param email - The recipient's email address.
     * @param username - The recipient's username.
     */
    @LogServiceMethod({ names: ['email', 'username'] })
    async sendAccountDeletionCancelled(email: string, username: string) {
        await queueManager.addJob(JOB_NAMES.SEND_ACCOUNT_DELETION_CANCELLED, {
            to: { name: username, address: email },
            locale: RequestContext.getUserLocale() ?? DEFAULT_LOCALE
        });
    }

    /**
     * Sends an account deleted confirmation email.
     *
     * @param email - The recipient's email address.
     * @param username - The recipient's username.
     */
    @LogServiceMethod({ names: ['email', 'username'] })
    async sendAccountDeleted(email: string, username: string) {
        await queueManager.addJob(JOB_NAMES.SEND_ACCOUNT_DELETED, {
            to: { name: username, address: email },
            locale: RequestContext.getUserLocale() ?? DEFAULT_LOCALE
        });
    }
}

export const mailService = new MailService();
