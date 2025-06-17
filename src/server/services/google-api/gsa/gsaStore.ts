import path from 'path';
import fs from 'fs/promises';
import { ENV_CONFIG_PRIVATE } from '@/common/constants';

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

const gsaPath = Object.freeze({
    GOOGLE_LOGGING_WRITE_CREDENTIALS:
        ENV_CONFIG_PRIVATE.GOOGLE_LOGGING_WRITE_CREDENTIALS,
    GOOGLE_STORAGE_CREDENTIALS: ENV_CONFIG_PRIVATE.GOOGLE_STORAGE_CREDENTIALS
});

export const loadServiceAccount = async (
    id: keyof typeof gsaPath
): Promise<ServiceAccount> => {
    const serviceAccount = await fs.readFile(
        path.join(process.cwd(), gsaPath[id])
    );

    return JSON.parse(serviceAccount.toString());
};
