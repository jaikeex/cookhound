import { mailClient } from './client';
import { emailVerificationTemplate } from './templates/email-verification';
import { ENV_CONFIG_PUBLIC } from '@/common/constants';

class MailService {
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
