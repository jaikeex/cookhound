import Typesense from 'typesense';
import { ENV_CONFIG_PUBLIC, ENV_CONFIG_PRIVATE } from '@/common/constants/env';
import { Logger } from '@/server/logger';
import { randomUUID } from 'crypto';
import { InfrastructureError } from '@/server/error';
import { InfrastructureErrorCode } from '@/server/error/codes';

const log = Logger.getInstance('typesense-client');

//?—————————————————————————————————————————————————————————————————————————————————————————————?//
//?                                      GLOBAL SINGLETON                                       ?//
///
//# This is an overkill implementation of the singleton pattern. I initially started working
//# on this for the purpose of eliminatiing new client creation on every reload in dev mode...
//# This did NOT solve that problem, but i like it and think it's cool, so it stays.
//#
//# How this works:
//# (1) A lightweight shell object is attached to global
//# (2) At first import the property doesn’t exist, so TypesenseClient.getInstance() creates
//#     it and stores the client with a random instanceId.
//# (3) TypesenseClient.getInstance() always returns the same global object
//# (4) The module exports the instance once, this strengthens the singleton thanks to js module cache
//#
//# One interesting thing I learned here was that when declaring variables in global object
//# var is needed, no let. This was explained to me by o3 as follows:
//# - What we are doing is augmenting the globalThis object at runtime and telling TypeScript about it.
//# - Only an ambient var declaration (declare var foo: ...) maps 1-to-1 to a real writable
//#   property on globalThis.
//# - let/const inside a declare global { ... } block would describe block-scoped bindings that
//#   do not become a property on globalThis, so global.__cookhound_typesense_client__
//#   would be undefined at runtime.
//# - Additionally, Node (and many bundlers) tolerate re-declaring the same ambient var in
//#   multiple modules, which is useful during hot reloads. Re-declaring a let/const would
//#   throw a SyntaxError on the second load.
///
//?—————————————————————————————————————————————————————————————————————————————————————————————?//

//~=============================================================================================~//
//$                                    GLOBAL SINGLETON SYMBOL                                  $//
//~=============================================================================================~//

interface GlobalTypesenseClient {
    instance: TypesenseClient | null;
    instanceId: string;
}

declare global {
    //~ see explanation above
    // eslint-disable-next-line no-var
    var __cookhound_typesense_client__: GlobalTypesenseClient | undefined;
}

//~=============================================================================================~//
//$                                         CLIENT CLASS                                        $//
//~=============================================================================================~//

class TypesenseClient {
    private client: any; // No ts support for typesense sadly...
    private readonly instanceId: string;

    //~-----------------------------------------------------------------------------------------~//
    //$                                       CONSTRUCTOR                                       $//
    //~-----------------------------------------------------------------------------------------~//

    private constructor() {
        // Generate unique instance ID for tracking
        this.instanceId = `${process.pid}-${randomUUID}`;

        try {
            this.client = new Typesense.Client({
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

            log.info('Typesense client initialised', {
                instanceId: this.instanceId,
                processId: process.pid,
                host: ENV_CONFIG_PUBLIC.TYPESENSE_HOST,
                port: ENV_CONFIG_PUBLIC.TYPESENSE_PORT
            });
        } catch (error: unknown) {
            log.errorWithStack('Failed to initialise Typesense client', error, {
                instanceId: this.instanceId,
                processId: process.pid
            });
            throw new InfrastructureError(
                InfrastructureErrorCode.TYPESENSE_INIT_FAILED
            );
        }
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                         GETTERS                                         $//
    //~-----------------------------------------------------------------------------------------~//

    static getInstance(): TypesenseClient {
        if (!global.__cookhound_typesense_client__) {
            global.__cookhound_typesense_client__ = {
                instance: null,
                instanceId: ''
            };
        }

        const globalStore = global.__cookhound_typesense_client__;

        if (!globalStore.instance) {
            globalStore.instance = new TypesenseClient();
            globalStore.instanceId = globalStore.instance.instanceId;

            log.info('Created new Typesense client instance', {
                instanceId: globalStore.instanceId,
                processId: process.pid
            });
        } else {
            log.trace('Reusing existing Typesense client instance', {
                instanceId: globalStore.instanceId,
                processId: process.pid
            });
        }

        return globalStore.instance;
    }

    getClient(): any {
        return this.client;
    }

    getInstanceId(): string {
        return this.instanceId;
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                    HEALTH CHECK                                         $//
    //~-----------------------------------------------------------------------------------------~//

    async healthCheck(): Promise<boolean> {
        try {
            const health = await this.client.health.retrieve();
            log.trace('Typesense health check successful', {
                instanceId: this.instanceId,
                health
            });
            return health.ok === true;
        } catch (error: unknown) {
            log.error('Typesense health check failed', error, {
                instanceId: this.instanceId
            });
            return false;
        }
    }
}

const typesenseClient = TypesenseClient.getInstance();
export default typesenseClient;
