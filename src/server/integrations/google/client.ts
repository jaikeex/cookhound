import { InfrastructureError } from '@/server/error';
import { loadServiceAccount } from './gsa/gsaStore';
import { TokenManager } from './tokenManager';
import type { ServiceAccount, ServiceAccountIdentifier } from './types';
import { Logger } from '@/server/logger';
import { InfrastructureErrorCode } from '@/server/error/codes';

const log = Logger.getInstance('google-api-client');

const SERVICE_ACCOUNT_SCOPES: Record<ServiceAccountIdentifier, string[]> = {
    GOOGLE_STORAGE_CREDENTIALS: [
        'https://www.googleapis.com/auth/devstorage.read_write'
    ],
    GOOGLE_LOGGING_WRITE_CREDENTIALS: [
        'https://www.googleapis.com/auth/logging.write'
    ],
    GOOGLE_GMAIL_SEND_CREDENTIALS: [
        'https://www.googleapis.com/auth/gmail.send'
    ]
};

type ServiceAccountMap = {
    [key in ServiceAccountIdentifier]: TokenManager;
};

class GoogleApiClient {
    private static instance: GoogleApiClient;
    private tokenManagers: Partial<ServiceAccountMap> = {};
    private initializationPromise: Promise<void> | null = null;

    private constructor() {
        this.initializationPromise = this.initialize();
    }

    public static getInstance(): GoogleApiClient {
        if (!GoogleApiClient.instance) {
            GoogleApiClient.instance = new GoogleApiClient();
        }
        return GoogleApiClient.instance;
    }

    private async initialize() {
        const serviceAccountIds = Object.keys(
            SERVICE_ACCOUNT_SCOPES
        ) as ServiceAccountIdentifier[];

        for (const id of serviceAccountIds) {
            try {
                const serviceAccount = await loadServiceAccount(id);
                this.validateServiceAccount(serviceAccount);

                const scopes = SERVICE_ACCOUNT_SCOPES[id];
                this.tokenManagers[id] = new TokenManager(
                    serviceAccount,
                    scopes
                );
            } catch (error: unknown) {
                log.errorWithStack(
                    'initialize - failed to initialize google api client',
                    error
                );
                throw new InfrastructureError(
                    InfrastructureErrorCode.GOOGLE_API_REQUEST_FAILED
                );
            }
        }
    }

    private validateServiceAccount(serviceAccount: ServiceAccount): void {
        const requiredFields = ['client_email', 'private_key', 'project_id'];
        for (const field of requiredFields) {
            if (!serviceAccount[field as keyof ServiceAccount]) {
                log.error(
                    'validateServiceAccount - missing required google service account field',
                    undefined,
                    { field }
                );
                throw new InfrastructureError(
                    InfrastructureErrorCode.GOOGLE_API_REQUEST_FAILED
                );
            }
        }
    }

    private async ensureInitialized(): Promise<void> {
        if (this.initializationPromise) {
            await this.initializationPromise;
        }
    }

    private async getAccessToken(
        service: ServiceAccountIdentifier,
        subject?: string
    ): Promise<string> {
        await this.ensureInitialized();
        const manager = this.tokenManagers[service];
        if (!manager) {
            log.error(
                'getAccessToken - google service account not initialized or configured',
                undefined,
                { service }
            );
            throw new InfrastructureError(
                InfrastructureErrorCode.GOOGLE_API_REQUEST_FAILED
            );
        }
        return manager.getAccessToken(subject);
    }

    private async authenticatedRequest(
        service: ServiceAccountIdentifier,
        url: string,
        init?: RequestInit,
        subject?: string
    ): Promise<Response> {
        const token = await this.getAccessToken(service, subject);
        const headers = new Headers(init?.headers);
        headers.set('Authorization', `Bearer ${token}`);

        const requestInit = {
            ...init,
            headers
        };

        return fetch(url, requestInit);
    }

    // Placeholder for storage-specific methods
    public getStorageService() {
        return {
            upload: async (
                fileName: string,
                data: BodyInit,
                bucket: string,
                contentType: string
            ) => {
                const url = `https://storage.googleapis.com/upload/storage/v1/b/${bucket}/o?uploadType=media&name=${fileName}`;
                const headers = new Headers();

                headers.set('Content-Type', contentType);

                return this.authenticatedRequest(
                    'GOOGLE_STORAGE_CREDENTIALS',
                    url,
                    { method: 'POST', body: data, headers }
                );
            },

            download: async (bucket: string, fileName: string) => {
                const url = `https://storage.googleapis.com/storage/v1/b/${bucket}/o/${fileName}?alt=media`;
                return this.authenticatedRequest(
                    'GOOGLE_STORAGE_CREDENTIALS',
                    url
                );
            },

            delete: async (bucket: string, fileName: string) => {
                const url = `https://storage.googleapis.com/storage/v1/b/${bucket}/o/${fileName}`;
                return this.authenticatedRequest(
                    'GOOGLE_STORAGE_CREDENTIALS',
                    url,
                    { method: 'DELETE' }
                );
            }
        };
    }

    // Placeholder for logging-specific methods
    public getLoggingService() {
        return {
            writeLogs: (logs: unknown[]) => {
                const url = `https://logging.googleapis.com/v2/entries:write`;
                const body = {
                    entries: logs
                };
                return this.authenticatedRequest(
                    'GOOGLE_LOGGING_WRITE_CREDENTIALS',
                    url,
                    { method: 'POST', body: JSON.stringify(body) }
                );
            }
        };
    }

    // Gmail service
    public getGmailService() {
        return {
            sendMail: async (params: {
                from: string;
                to: string | string[];
                subject: string;
                html: string;
                text?: string;
            }) => {
                const { from, to, subject, html, text } = params;
                const toHeader = Array.isArray(to) ? to.join(', ') : to;

                const messageLines = [
                    `From: ${from}`,
                    `To: ${toHeader}`,
                    `Subject: ${subject}`,
                    'MIME-Version: 1.0',
                    'Content-Type: text/html; charset="UTF-8"',
                    '',
                    html,
                    text ?? ''
                ];

                const rawMessage = Buffer.from(
                    messageLines.join('\r\n')
                ).toString('base64url');

                // Gmail userId should be the raw email or "me"; extract email if display name provided
                const emailMatch = /<(.+?)>/.exec(from);
                const userId = emailMatch ? emailMatch[1] : from;

                if (!userId) {
                    throw new InfrastructureError(
                        InfrastructureErrorCode.GOOGLE_API_REQUEST_FAILED
                    );
                }

                const url = `https://gmail.googleapis.com/gmail/v1/users/${encodeURIComponent(
                    userId
                )}/messages/send`;

                return await this.authenticatedRequest(
                    'GOOGLE_GMAIL_SEND_CREDENTIALS',
                    url,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ raw: rawMessage })
                    },
                    emailMatch ? emailMatch[1] : undefined
                );
            }
        };
    }
}

const googleApiClient = GoogleApiClient.getInstance();
export default googleApiClient;
