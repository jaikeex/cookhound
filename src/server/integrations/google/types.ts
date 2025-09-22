import type { ServiceAccount as GsaServiceAccount } from './gsa/gsaStore';

export type ServiceAccount = GsaServiceAccount;

export type AccessToken = {
    access_token: string;
    expires_in: number;
    token_type: string;
};

export type ServiceAccountIdentifier =
    | 'GOOGLE_LOGGING_WRITE_CREDENTIALS'
    | 'GOOGLE_STORAGE_CREDENTIALS'
    | 'GOOGLE_GMAIL_SEND_CREDENTIALS';

export enum LogName {
    ERROR = '/logs/errors',
    EMAIL = '/logs/email'
}

export type StoragePayload = {
    fileName: string;
    data: BodyInit;
    bucket: string;
};

export type LogEntry = {
    severity: string;
    timestamp: string;
    labels: {
        context: string;
    };
    textPayload: string;
};
