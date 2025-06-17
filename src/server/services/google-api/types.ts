import type { ServiceAccount as GsaServiceAccount } from './gsa/gsaStore';

export type ServiceAccount = GsaServiceAccount;

export type AccessToken = {
    access_token: string;
    expires_in: number;
    token_type: string;
};

export type ServiceAccountIdentifier =
    | 'GOOGLE_LOGGING_WRITE_CREDENTIALS'
    | 'GOOGLE_STORAGE_CREDENTIALS';

export enum LogSeverity {
    DEFAULT = 'DEFAULT',
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    NOTICE = 'NOTICE',
    WARNING = 'WARNING',
    ERROR = 'ERROR',
    CRITICAL = 'CRITICAL',
    ALERT = 'ALERT',
    EMERGENCY = 'EMERGENCY'
}

export type LoggingResource = {
    type: string;
    labels: Record<string, string>;
};

export enum LogName {
    ERROR = '/logs/errors',
    EMAIL = '/logs/email',
    RECIPE = '/logs/recipe',
    USER = '/logs/user',
    DEFAULT = '/logs/default'
}

export type LogEntry = {
    severity: LogSeverity;
    logName: string;
    timestamp: string;
    jsonPayload: {
        message: string;
        severity: LogSeverity;
    };
};

export type StoragePayload = {
    fileName: string;
    data: BodyInit;
    bucket: string;
};
