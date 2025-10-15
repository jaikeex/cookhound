import { ENV_CONFIG_PRIVATE } from '@/common/constants/env';
import { InfrastructureError } from '@/server/error';
import { InfrastructureErrorCode } from '@/server/error/codes';

export type ServiceAccount = {
    type: string;
    project_id: string;
    private_key_id: string;
    private_key: string;
    client_email: string;
    client_id: string;
    auth_uri: string;
    token_uri: string;
    auth_provider_x509_cert_url: string;
    client_x509_cert_url: string;
};

const loadFromEnv = (
    envVarName: keyof typeof ENV_CONFIG_PRIVATE
): ServiceAccount => {
    const base64Creds = ENV_CONFIG_PRIVATE[envVarName];

    if (!base64Creds) {
        throw new InfrastructureError(
            InfrastructureErrorCode.GOOGLE_API_REQUEST_FAILED,
            `Missing Google Service Account credentials: ${envVarName} env variable is not set`
        );
    }

    try {
        const jsonString = Buffer.from(base64Creds, 'base64').toString('utf-8');
        const credentials = JSON.parse(jsonString) as ServiceAccount;

        if (
            !credentials.client_email ||
            !credentials.private_key ||
            !credentials.project_id
        ) {
            throw new InfrastructureError(
                InfrastructureErrorCode.GOOGLE_API_REQUEST_FAILED,
                `Invalid service account structure`
            );
        }

        return credentials;
    } catch (error: unknown) {
        throw new InfrastructureError(
            InfrastructureErrorCode.GOOGLE_API_REQUEST_FAILED,
            `Failed to parse Google Service Account credentials from ${envVarName}`
        );
    }
};

const gsaMap = Object.freeze({
    GOOGLE_LOGGING_WRITE_CREDENTIALS: (() =>
        loadFromEnv('GOOGLE_LOGGING_CREDENTIALS_BASE64'))(),
    GOOGLE_STORAGE_CREDENTIALS: (() =>
        loadFromEnv('GOOGLE_STORAGE_CREDENTIALS_BASE64'))(),
    GOOGLE_GMAIL_SEND_CREDENTIALS: (() =>
        loadFromEnv('GOOGLE_GMAIL_CREDENTIALS_BASE64'))()
});

export const loadServiceAccount = async (
    id: keyof typeof gsaMap
): Promise<ServiceAccount> => {
    return gsaMap[id];
};
