import { Logger, LogServiceMethod } from '@/server/logger';
import { queueManager } from '@/server/queues/QueueManager';
import { RequestContext } from '@/server/utils/reqwest/context/requestContext';
import { DEFAULT_LOCALE } from '@/common/constants/general';
import { JOB_NAMES } from '@/server/queues/jobs/names';

//|=============================================================================================|//

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const log = Logger.getInstance('mail-service');

/**
 * Enqueues transactional emails via BullMQ. All methods are fire-and-forget
 * from the caller's perspective, actual delivery happens in the worker process.
 * The recipient's locale is resolved from {@link RequestContext}.
 */
class MailService {
    /**
     * Enqueues an email verification link for a newly registered user.
     *
     * @param email - Recipient email address.
     * @param username - Recipient username (used in the email greeting).
     * @param token - Email verification token embedded in the link.
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
     * Enqueues a password reset link email.
     *
     * @param email - Recipient email address.
     * @param username - Recipient username (used in the email greeting).
     * @param token - Password reset token embedded in the link.
     */
    @LogServiceMethod({ names: ['email', 'username', 'token'] })
    async sendPasswordReset(email: string, username: string, token: string) {
        await queueManager.addJob(JOB_NAMES.SEND_PASSWORD_RESET_EMAIL, {
            token,
            to: { name: username, address: email },
            locale: RequestContext.getUserLocale() ?? DEFAULT_LOCALE
        });
    }

    /**
     * Enqueues a confirmation link email sent to the new email address
     * during an email change flow.
     *
     * @param email - The new email address to confirm.
     * @param token - Email change confirmation token.
     * @param username - Recipient username (used in the email greeting).
     */
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

    /**
     * Enqueues a notice to the user's current email address informing
     * them that an email change has been initiated.
     *
     * @param email - Current email address receiving the notice.
     * @param username - Recipient username (used in the email greeting).
     */
    @LogServiceMethod({ names: ['email', 'username'] })
    async sendEmailChangeNotice(email: string, username: string) {
        await queueManager.addJob(JOB_NAMES.SEND_EMAIL_CHANGE_NOTICE, {
            to: { name: username, address: email },
            locale: RequestContext.getUserLocale() ?? DEFAULT_LOCALE
        });
    }

    /**
     * Enqueues an audit notification to both the old and new email addresses
     * after a successful email change.
     *
     * @param oldEmail - Previous email address.
     * @param newEmail - Newly confirmed email address.
     * @param username - Recipient username (used in the email greeting).
     */
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
     * Enqueues a confirmation email after a user initiates account deletion.
     *
     * @param email - Recipient email address.
     * @param username - Recipient username (used in the email greeting).
     * @param scheduledDate - Locale-formatted date when deletion will occur.
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
     * Enqueues a notice that an admin has scheduled the user's account for deletion.
     *
     * @param email - Recipient email address.
     * @param username - Recipient username (used in the email greeting).
     * @param scheduledDate - Locale-formatted date when deletion will occur.
     */
    @LogServiceMethod({ names: ['email', 'username', 'scheduledDate'] })
    async sendAdminAccountDeletionNotice(
        email: string,
        username: string,
        scheduledDate: string
    ) {
        await queueManager.addJob(
            JOB_NAMES.SEND_ADMIN_ACCOUNT_DELETION_NOTICE,
            {
                scheduledDate,
                to: { name: username, address: email },
                locale: RequestContext.getUserLocale() ?? DEFAULT_LOCALE
            }
        );
    }

    /**
     * Enqueues a reminder email during the deletion grace period.
     *
     * @param email - Recipient email address.
     * @param username - Recipient username (used in the email greeting).
     * @param daysRemaining - Days remaining until permanent deletion.
     * @param scheduledDate - Locale-formatted date when deletion will occur.
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
     * Enqueues a confirmation that account deletion has been cancelled.
     *
     * @param email - Recipient email address.
     * @param username - Recipient username (used in the email greeting).
     */
    @LogServiceMethod({ names: ['email', 'username'] })
    async sendAccountDeletionCancelled(email: string, username: string) {
        await queueManager.addJob(JOB_NAMES.SEND_ACCOUNT_DELETION_CANCELLED, {
            to: { name: username, address: email },
            locale: RequestContext.getUserLocale() ?? DEFAULT_LOCALE
        });
    }

    /**
     * Enqueues a final notification after an account has been permanently deleted.
     *
     * @param email - Recipient email address.
     * @param username - Recipient username (used in the email greeting).
     */
    @LogServiceMethod({ names: ['email', 'username'] })
    async sendAccountDeleted(email: string, username: string) {
        await queueManager.addJob(JOB_NAMES.SEND_ACCOUNT_DELETED, {
            to: { name: username, address: email },
            locale: RequestContext.getUserLocale() ?? DEFAULT_LOCALE
        });
    }

    /**
     * Enqueues a contact form submission.
     *
     * @param name - Sender's display name.
     * @param email - Sender's email address (for replies).
     * @param subject - Subject line of the message.
     * @param message - Body of the contact form message.
     */
    @LogServiceMethod({ names: ['name', 'email', 'subject'] })
    async sendContactForm(
        name: string,
        email: string,
        subject: string,
        message: string
    ) {
        await queueManager.addJob(JOB_NAMES.SEND_CONTACT_FORM, {
            name,
            email,
            subject,
            message,
            locale: RequestContext.getUserLocale() ?? DEFAULT_LOCALE
        });
    }
}

export const mailService = new MailService();
