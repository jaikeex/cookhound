import { loadServiceAccount } from './gsa/gsaStore';
import { TokenManager } from './tokenManager';
import type { ServiceAccount, ServiceAccountIdentifier } from './types';

const SERVICE_ACCOUNT_SCOPES: Record<ServiceAccountIdentifier, string[]> = {
    GOOGLE_STORAGE_CREDENTIALS: [
        'https://www.googleapis.com/auth/devstorage.read_write'
    ],
    GOOGLE_LOGGING_WRITE_CREDENTIALS: [
        'https://www.googleapis.com/auth/logging.write'
    ]
};

type ServiceAccountMap = {
    [key in ServiceAccountIdentifier]: TokenManager;
};

class GoogleApiService {
    private static instance: GoogleApiService;
    private tokenManagers: Partial<ServiceAccountMap> = {};
    private initializationPromise: Promise<void> | null = null;

    private constructor() {
        this.initializationPromise = this.initialize();
    }

    public static getInstance(): GoogleApiService {
        if (!GoogleApiService.instance) {
            GoogleApiService.instance = new GoogleApiService();
        }
        return GoogleApiService.instance;
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
            } catch (error) {
                console.error(
                    `Failed to initialize service account ${id}:`,
                    error
                );
            }
        }
    }

    private validateServiceAccount(serviceAccount: ServiceAccount): void {
        const requiredFields = ['client_email', 'private_key', 'project_id'];
        for (const field of requiredFields) {
            if (!serviceAccount[field as keyof ServiceAccount]) {
                throw new Error(
                    `Missing required google service account field: ${field}`
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
        service: ServiceAccountIdentifier
    ): Promise<string> {
        await this.ensureInitialized();
        const manager = this.tokenManagers[service];
        if (!manager) {
            throw new Error(
                `Google service account ${service} not initialized or configured.`
            );
        }
        return manager.getAccessToken();
    }

    private async authenticatedRequest(
        service: ServiceAccountIdentifier,
        url: string,
        init?: RequestInit
    ): Promise<Response> {
        const token = await this.getAccessToken(service);
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
}

export const googleApiService = GoogleApiService.getInstance();
