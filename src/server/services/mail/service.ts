import { mailClient } from './client';
import { emailVerificationTemplate } from './templates/email-verification';
import { ENV_CONFIG_PUBLIC } from '@/common/constants';

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
    }
}

export const mailService = new MailService();
