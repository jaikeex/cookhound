import { mailClient } from './client';
import { emailVerificationTemplate } from './templates/email-verification';
import { resetPasswordTemplate } from './templates/reset-password';
import { ENV_CONFIG_PUBLIC } from '@/common/constants';
import { Logger } from '@/server/logger';

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
        log.trace('attempting to send verification email', { email, username });

        const verificationLink = `${ENV_CONFIG_PUBLIC.ORIGIN}/auth/callback/verify-email?token=${token}`;
        const html = emailVerificationTemplate(username, verificationLink);

        await mailClient.send({
            from: {
                name: 'Cookhound',
                address: 'no-reply@cookhound.com'
            },
            to: {
                name: username,
                address: email
            },
            subject: 'Welcome to CookHound!',
            html
        });

        log.notice('verification email sent', { email, username });

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
        log.trace('attempting to send password reset email', {
            email,
            username
        });

        const reset_link = `${ENV_CONFIG_PUBLIC.ORIGIN}/auth/callback/reset-password?token=${token}`;
        const html = resetPasswordTemplate(username, reset_link);

        await mailClient.send({
            from: {
                name: 'Cookhound',
                address: 'no-reply@cookhound.com'
            },
            to: {
                name: username,
                address: email
            },
            subject: 'Password reset',
            html
        });

        log.info('password reset email sent', { email, username });

        return;
    }
}

export const mailService = new MailService();
