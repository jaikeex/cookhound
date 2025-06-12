function createConfig<T extends Record<string, string | undefined>>(
    config: T,
    configName: string,
    isValidationEnabled: boolean
): Readonly<{ [K in keyof T]: string }> {
    if (isValidationEnabled) {
        for (const [key, value] of Object.entries(config)) {
            if (!value) {
                throw new Error(
                    `Missing environment variable ${key} in ${configName}`
                );
            }
        }
    }

    return Object.freeze(config as { [K in keyof T]: string });
}

export const ENV_CONFIG_PUBLIC = createConfig(
    {
        ENV: process.env.NEXT_PUBLIC_ENV,
        API_URL: process.env.NEXT_PUBLIC_API_URL,
        GOOGLE_OAUTH_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID,
        ORIGIN: process.env.NEXT_PUBLIC_ORIGIN,
        COOKIE_DOMAIN: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
        GOOGLE_STORAGE_BUCKET_RECIPE_IMAGES:
            process.env.NEXT_PUBLIC_GOOGLE_STORAGE_BUCKET_RECIPE_IMAGES
    },
    'ENV_CONFIG_PUBLIC',
    process.env.NEXT_PUBLIC_ENV !== 'test'
);

export const ENV_CONFIG_PRIVATE = createConfig(
    {
        DB_NAME: process.env.DB_NAME,
        DB_USERNAME: process.env.DB_USERNAME,
        DB_PASSWORD: process.env.DB_PASSWORD,
        DB_PORT: process.env.DB_PORT,
        DATABASE_URL: process.env.DATABASE_URL,
        DB_CONNECTIONS: process.env.DB_CONNECTIONS,
        DB_IDLE_TIMEOUT: process.env.DB_IDLE_TIMEOUT,
        DB_ACQUIRE_TIMEOUT: process.env.DB_ACQUIRE_TIMEOUT,
        DB_MAX_ATTEMPTS: process.env.DB_MAX_ATTEMPTS,
        GOOGLE_SMTP_USERNAME: process.env.GOOGLE_SMTP_USERNAME,
        GOOGLE_SMTP_PASSWORD: process.env.GOOGLE_SMTP_PASSWORD,
        JWT_SECRET: process.env.JWT_SECRET,
        JWT_TOKEN_DURATION_DAYS: process.env.JWT_TOKEN_DURATION_DAYS,
        JWT_ISSUER: process.env.JWT_ISSUER,
        GOOGLE_API_PROJECT_ID: process.env.GOOGLE_API_PROJECT_ID,
        GOOGLE_LOGGING_WRITE_CREDENTIALS:
            process.env.GOOGLE_LOGGING_WRITE_CREDENTIALS,
        GOOGLE_LOGGING_CLIENT_ID: process.env.GOOGLE_LOGGING_CLIENT_ID,
        GOOGLE_OAUTH_CLIENT_SECRET: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
        GOOGLE_OAUTH_REDIRECT_URI: process.env.GOOGLE_OAUTH_REDIRECT_URI,
        GOOGLE_STORAGE_CREDENTIALS: process.env.GOOGLE_STORAGE_CREDENTIALS,
        GOOGLE_STORAGE_CLIENT_ID: process.env.GOOGLE_STORAGE_CLIENT_ID
    },
    'ENV_CONFIG_PRIVATE',
    process.env.NEXT_PUBLIC_ENV !== 'test' && typeof window === 'undefined'
);
