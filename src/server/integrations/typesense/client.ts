import Typesense from 'typesense';
import { ENV_CONFIG_PUBLIC, ENV_CONFIG_PRIVATE } from '@/common/constants/env';
import { Logger } from '@/server/logger';

const log = Logger.getInstance('typesense-client');

class TypesenseClient {
    private static instance: TypesenseClient | null = null;
    private client: any; // No ts support for typesense sadly...

    private constructor() {
        try {
            this.client = new (Typesense as any).Client({
                nodes: [
                    {
                        host: ENV_CONFIG_PUBLIC.TYPESENSE_HOST,
                        port: Number(ENV_CONFIG_PUBLIC.TYPESENSE_PORT),
                        protocol: ENV_CONFIG_PUBLIC.TYPESENSE_PROTOCOL
                    }
                ],
                apiKey: ENV_CONFIG_PRIVATE.TYPESENSE_API_KEY,
                connectionTimeoutSeconds: 5,
                numRetries: 3
            });

            log.info('Typesense client initialised');
        } catch (err) {
            log.error('Failed to initialise Typesense client', { err });
            throw err;
        }
    }

    static getInstance(): TypesenseClient {
        if (!TypesenseClient.instance) {
            TypesenseClient.instance = new TypesenseClient();
        }
        return TypesenseClient.instance;
    }

    getClient(): any {
        return this.client;
    }
}

export { TypesenseClient };
