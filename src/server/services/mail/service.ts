import { mailClient } from './client';
import { emailVerificationTemplate } from './templates/email-verification';

class MailService {
    async sendEmailVerification(
        email: string,
        username: string,
        token: string
    ) {
        const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;
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
