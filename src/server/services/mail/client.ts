import { ENV_CONFIG_PRIVATE } from '@/common/constants/env';
import net from 'net';
import tls from 'tls';

/**
 * Defines the structure for a mail address, containing the sender's or
 * recipient's name and email address.
 */
interface MailAddress {
    name: string;
    address: string;
}

/**
 * Defines the options for an email, including sender, recipient, subject,
 * and HTML content.
 */
interface MailOptions {
    from: MailAddress;
    to: MailAddress;
    subject: string;
    html: string;
}

/**
 * A service for sending emails using Google's SMTP server without any
 * third-party libraries. It handles the entire SMTP conversation, including
 * the TLS upgrade and authentication.
 */
export class MailClient {
    private readonly smtpHost = 'smtp.gmail.com';
    private readonly smtpPort = 587;
    private readonly user: string;
    private readonly pass: string;
    private socket!: net.Socket | tls.TLSSocket;

    constructor() {
        if (
            !ENV_CONFIG_PRIVATE.GOOGLE_SMTP_USERNAME ||
            !ENV_CONFIG_PRIVATE.GOOGLE_SMTP_PASSWORD
        ) {
            throw new Error('SMTP credentials are not configured.');
        }

        this.user = ENV_CONFIG_PRIVATE.GOOGLE_SMTP_USERNAME;
        this.pass = ENV_CONFIG_PRIVATE.GOOGLE_SMTP_PASSWORD;
    }

    /**
     * Sends an email by establishing a connection to the SMTP server,
     * authenticating, and sending the email data.
     * @param options - The email options.
     */
    public async send(options: MailOptions): Promise<void> {
        if (!this.user || !this.pass) {
            throw new Error('SMTP credentials are not configured.');
        }

        try {
            await this.connect();
            await this.upgradeToTls();
            await this.authenticate();
            await this.sendEmail(options);
            await this.quit();
        } catch (error) {
            console.error('Failed to send email:', error);
            throw error; // Rethrow to be handled by the caller
        } finally {
            if (this.socket) {
                this.socket.end();
            }
        }
    }

    private connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.socket = net.createConnection({
                port: this.smtpPort,
                host: this.smtpHost
            });
            this.socket.setEncoding('utf-8');
            this.socket.once('connect', () => {
                this.socket.removeListener('error', reject);
                console.log('Successfully connected to the SMTP server.');
                resolve();
            });
            this.socket.once('error', reject);
        });
    }

    private readResponse(): Promise<string> {
        return new Promise((resolve, reject) => {
            let response = '';
            const onData = (data: string) => {
                response += data;
                const lines = response.split('\r\n');
                if (
                    lines.length > 1 &&
                    /^\d{3} /.test(lines[lines.length - 2])
                ) {
                    this.socket.removeListener('data', onData);
                    this.socket.removeListener('error', onError);
                    resolve(response);
                }
            };
            const onError = (err: Error) => {
                this.socket.removeListener('data', onData);
                reject(err);
            };
            this.socket.on('data', onData);
            this.socket.once('error', onError);
        });
    }

    private async sendAndVerify(
        command: string,
        expectedCode: number
    ): Promise<string> {
        this.socket.write(command + '\r\n');
        const response = await this.readResponse();
        const responseCode = parseInt(response.substring(0, 3), 10);
        if (responseCode !== expectedCode) {
            throw new Error(
                `Unexpected SMTP response. Expected ${expectedCode}, got ${responseCode}: ${response}`
            );
        }
        return response;
    }

    private async upgradeToTls(): Promise<void> {
        const greeting = await this.readResponse();
        if (parseInt(greeting.substring(0, 3), 10) !== 220) {
            throw new Error('Did not receive SMTP greeting.');
        }

        await this.sendAndVerify(`EHLO ${this.smtpHost}`, 250);
        await this.sendAndVerify('STARTTLS', 220);

        return new Promise((resolve, reject) => {
            this.socket = tls.connect(
                {
                    socket: this.socket,
                    host: this.smtpHost
                },
                () => {
                    this.socket.setEncoding('utf-8');
                    console.log('TLS connection established.');
                    resolve();
                }
            );
            this.socket.once('error', reject);
        });
    }

    private async authenticate(): Promise<void> {
        await this.sendAndVerify(`EHLO ${this.smtpHost}`, 250);
        await this.sendAndVerify('AUTH LOGIN', 334);
        await this.sendAndVerify(
            Buffer.from(this.user).toString('base64'),
            334
        );

        const pass64 = Buffer.from(this.pass).toString('base64');
        this.socket.write(pass64 + '\r\n');
        const response = await this.readResponse();
        if (parseInt(response.substring(0, 3), 10) !== 235) {
            throw new Error('SMTP authentication failed.');
        }
        console.log('Authentication successful.');
    }

    private buildEmail(options: MailOptions): string {
        const from = `"${options.from.name}" <${options.from.address}>`;
        const to = `"${options.to.name}" <${options.to.address}>`;

        let email = `From: ${from}\r\n`;
        email += `To: ${to}\r\n`;
        email += `Subject: ${options.subject}\r\n`;
        email += 'Content-Type: text/html; charset=utf-8\r\n\r\n';
        email += options.html;

        return email;
    }

    private async sendEmail(options: MailOptions): Promise<void> {
        await this.sendAndVerify(`MAIL FROM:<${options.from.address}>`, 250);
        await this.sendAndVerify(`RCPT TO:<${options.to.address}>`, 250);
        await this.sendAndVerify('DATA', 354);

        const emailData = this.buildEmail(options);
        await this.sendAndVerify(emailData + '\r\n.', 250);
        console.log('Email sent successfully.');
    }

    private async quit(): Promise<void> {
        try {
            await this.sendAndVerify('QUIT', 221);
        } catch (error) {
            console.warn('Error during QUIT, but ignoring:', error);
        }
    }
}

export const mailClient = new MailClient();
