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
        TYPESENSE_SEARCH_ONLY_KEY:
            process.env.NEXT_PUBLIC_TYPESENSE_SEARCH_ONLY_KEY,
        TYPESENSE_HOST: process.env.NEXT_PUBLIC_TYPESENSE_HOST,
        TYPESENSE_PORT: process.env.NEXT_PUBLIC_TYPESENSE_PORT,
        TYPESENSE_PROTOCOL: process.env.NEXT_PUBLIC_TYPESENSE_PROTOCOL
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
        REDIS_TTL: process.env.REDIS_TTL,
        REDIS_PASSWORD: process.env.REDIS_PASSWORD,
        REDIS_HOST: process.env.REDIS_HOST,
        REDIS_PORT: process.env.REDIS_PORT,
        GOOGLE_SMTP_USERNAME: process.env.GOOGLE_SMTP_USERNAME,
        GOOGLE_SMTP_PASSWORD: process.env.GOOGLE_SMTP_PASSWORD,
        LOG_DIR: process.env.LOG_DIR,
        GOOGLE_API_PROJECT_ID: process.env.GOOGLE_API_PROJECT_ID,
        GOOGLE_LOGGING_WRITE_CREDENTIALS:
            process.env.GOOGLE_LOGGING_WRITE_CREDENTIALS,
        GOOGLE_LOGGING_CLIENT_ID: process.env.GOOGLE_LOGGING_CLIENT_ID,
        GOOGLE_OAUTH_CLIENT_SECRET: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
        GOOGLE_OAUTH_REDIRECT_URI: process.env.GOOGLE_OAUTH_REDIRECT_URI,
        GOOGLE_STORAGE_CREDENTIALS: process.env.GOOGLE_STORAGE_CREDENTIALS,
        GOOGLE_STORAGE_CLIENT_ID: process.env.GOOGLE_STORAGE_CLIENT_ID,
        GOOGLE_STORAGE_BUCKET_RECIPE_IMAGES:
            process.env.GOOGLE_STORAGE_BUCKET_RECIPE_IMAGES,
        GOOGLE_STORAGE_BUCKET_AVATAR_IMAGES:
            process.env.GOOGLE_STORAGE_BUCKET_AVATAR_IMAGES,
        TYPESENSE_API_KEY: process.env.TYPESENSE_API_KEY,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
        ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
        MAIL_DRIVER: process.env.MAIL_DRIVER,
        MAIL_GMAIL_FROM: process.env.MAIL_GMAIL_FROM
    },
    'ENV_CONFIG_PRIVATE',
    process.env.NEXT_PUBLIC_ENV !== 'test' && typeof window === 'undefined'
);
