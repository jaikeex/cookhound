/**
 * This folder is not included in git. Be sure to copy it manually.
 */
import accounts from './accounts';

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

const gsaMap = Object.freeze({
    GOOGLE_LOGGING_WRITE_CREDENTIALS: accounts.logging,
    GOOGLE_STORAGE_CREDENTIALS: accounts.storage,
    GOOGLE_GMAIL_SEND_CREDENTIALS: accounts.mail
});

export const loadServiceAccount = async (
    id: keyof typeof gsaMap
): Promise<ServiceAccount> => {
    return gsaMap[id];
};
