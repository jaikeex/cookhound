// Needs to be accessed directly. ENV_CONFIG is not available in test mode.
export const IS_TEST_MODE = process.env.NEXT_PUBLIC_ENV === 'test';

/**
 * Builds an external-integration client that is safe to import in unit tests.
 *
 * Integration SDKs validate their credentials in the constructor,
 * so initializing the client at import time throws whenever a test
 * imports the module without live credentials. Which is every test. lol...
 */
export const deferClientInTestMode = <T extends object>(
    clientName: string,
    factory: () => T
): T => {
    if (!IS_TEST_MODE) {
        return factory();
    }

    return new Proxy({} as T, {
        get(_target, prop) {
            // inspection probes (e.g. console.log, vitest internals...)
            // touch these without meaning to use the client. Other than those,
            // every real member access should throw.
            if (prop === 'then' || typeof prop === 'symbol') {
                return undefined;
            }

            throw new Error(
                `Attempted to access "${prop}" on the ${clientName} client in test mode.`
            );
        }
    });
};
