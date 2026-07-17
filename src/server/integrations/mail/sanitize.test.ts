import { describe, it, expect } from 'vitest';
import { describeSmtpCommand, OMITTED_COMMAND } from './sanitize';

/**
 * Regression guard for a log-leak: `sendAndVerify` logs the failing SMTP
 * command on an unexpected response code. On the DATA step that "command" is
 * the entire RFC-822 message — including single-use verification / password-
 * reset token links in the HTML body — and on the AUTH step it is the base64
 * SMTP credentials. `describeSmtpCommand` must reduce those to a placeholder
 * while keeping ordinary verbs readable for debugging.
 */

describe('describeSmtpCommand', () => {
    it('keeps recognised SMTP verb command lines readable', () => {
        expect(describeSmtpCommand('EHLO smtp.example.com')).toBe(
            'EHLO smtp.example.com'
        );
        expect(describeSmtpCommand('MAIL FROM:<a@b.com>')).toBe(
            'MAIL FROM:<a@b.com>'
        );
        expect(describeSmtpCommand('RCPT TO:<c@d.com>')).toBe(
            'RCPT TO:<c@d.com>'
        );
        expect(describeSmtpCommand('DATA')).toBe('DATA');
        expect(describeSmtpCommand('AUTH LOGIN')).toBe('AUTH LOGIN');
        expect(describeSmtpCommand('QUIT')).toBe('QUIT');
    });

    it('matches verbs case-insensitively', () => {
        expect(describeSmtpCommand('ehlo smtp.example.com')).toBe(
            'ehlo smtp.example.com'
        );
    });

    it('omits the DATA payload that carries a token-bearing link', () => {
        const emailBody =
            'From: "Cookhound" <no-reply@cookhound.com>\r\n' +
            'To: "Victim" <victim@example.com>\r\n' +
            'Subject: Verify your email\r\n' +
            'Content-Type: text/html; charset=UTF-8\r\n\r\n' +
            '<a href="https://cookhound.com/auth/callback/verify-email?token=SUPER_SECRET_TOKEN&email=victim@example.com">Verify</a>' +
            '\r\n.';

        const out = describeSmtpCommand(emailBody);

        expect(out).toBe(OMITTED_COMMAND);
        expect(out).not.toContain('SUPER_SECRET_TOKEN');
    });

    it('omits the base64 AUTH credential blob', () => {
        // e.g. Buffer.from('smtp-user').toString('base64')
        const base64Username = 'c210cC11c2Vy';

        const out = describeSmtpCommand(base64Username);

        expect(out).toBe(OMITTED_COMMAND);
        expect(out).not.toContain(base64Username);
    });

    it('handles an empty command safely', () => {
        expect(describeSmtpCommand('')).toBe(OMITTED_COMMAND);
    });
});
