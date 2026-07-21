const OPTIONAL_ENV = Symbol('optionalEnv');

type OptionalEnvVar = Readonly<{
    [OPTIONAL_ENV]: true;
    value: string | undefined;
}>;

/**
 * Marks an environment variable as optional.
 *
 * A marked var is exempt from boot-time validation: it will not throw when
 * unset, and its resolved type widens to `string | undefined` (unmarked vars
 * stay required and typed as `string`).
 *
 *! This suppresses validation ONLY !
 * It makes no guarantee about runtime behavior. Every consumer of an optional
 * var is responsible for handling both cases
 */
function optional(value: string | undefined): OptionalEnvVar {
    return { [OPTIONAL_ENV]: true, value };
}

function isOptional(entry: unknown): entry is OptionalEnvVar {
    return typeof entry === 'object' && entry !== null && OPTIONAL_ENV in entry;
}

type EnvConfigInput = Record<string, string | undefined | OptionalEnvVar>;

type ResolvedEnvConfig<T extends EnvConfigInput> = Readonly<{
    [K in keyof T]: T[K] extends OptionalEnvVar ? string | undefined : string;
}>;

function createConfig<T extends EnvConfigInput>(
    config: T,
    configName: string,
    isValidationEnabled: boolean
): ResolvedEnvConfig<T> {
    const resolved: Record<string, string | undefined> = {};

    for (const [key, entry] of Object.entries(config)) {
        const entryIsOptional = isOptional(entry);
        const value = entryIsOptional ? entry.value : entry;

        if (isValidationEnabled && !entryIsOptional && !value) {
            throw new Error(
                `Missing environment variable ${key} in ${configName}`
            );
        }

        resolved[key] = value;
    }

    return Object.freeze(resolved) as ResolvedEnvConfig<T>;
}

export const ENV_CONFIG_PUBLIC = createConfig(
    {
        ENV: process.env.NEXT_PUBLIC_ENV,
        API_URL: process.env.NEXT_PUBLIC_API_URL,
        GOOGLE_OAUTH_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID,
        ORIGIN: process.env.NEXT_PUBLIC_ORIGIN,
        COOKIE_DOMAIN: optional(process.env.NEXT_PUBLIC_COOKIE_DOMAIN),
        TYPESENSE_HOST: process.env.NEXT_PUBLIC_TYPESENSE_HOST,
        TYPESENSE_PORT: process.env.NEXT_PUBLIC_TYPESENSE_PORT,
        TYPESENSE_PROTOCOL: process.env.NEXT_PUBLIC_TYPESENSE_PROTOCOL,
        CAPTCHA_SITE_KEY: optional(process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY),
        GA_MEASUREMENT_ID: optional(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID)
    },
    'ENV_CONFIG_PUBLIC',
    process.env.NEXT_PUBLIC_ENV !== 'test'
);

export const ENV_CONFIG_PRIVATE = createConfig(
    {
        DB_SSL: process.env.DB_SSL,
        DATABASE_URL: process.env.DATABASE_URL,
        REDIS_TTL: process.env.REDIS_TTL,
        REDIS_PASSWORD: process.env.REDIS_PASSWORD,
        REDIS_HOST: process.env.REDIS_HOST,
        REDIS_PORT: process.env.REDIS_PORT,
        SMTP_HOST: process.env.SMTP_HOST,
        SMTP_USERNAME: process.env.SMTP_USERNAME,
        SMTP_PASSWORD: process.env.SMTP_PASSWORD,
        LOG_DIR: optional(process.env.LOG_DIR),
        GOOGLE_LOGGING_CREDENTIALS_BASE64:
            process.env.GOOGLE_LOGGING_CREDENTIALS_BASE64,
        GOOGLE_STORAGE_CREDENTIALS_BASE64:
            process.env.GOOGLE_STORAGE_CREDENTIALS_BASE64,
        GOOGLE_GMAIL_CREDENTIALS_BASE64:
            process.env.GOOGLE_GMAIL_CREDENTIALS_BASE64,
        GOOGLE_API_PROJECT_ID: process.env.GOOGLE_API_PROJECT_ID,
        GOOGLE_OAUTH_CLIENT_SECRET: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
        GOOGLE_OAUTH_REDIRECT_URI: process.env.GOOGLE_OAUTH_REDIRECT_URI,
        GOOGLE_STORAGE_BUCKET_RECIPE_IMAGES:
            process.env.GOOGLE_STORAGE_BUCKET_RECIPE_IMAGES,
        GOOGLE_STORAGE_BUCKET_AVATAR_IMAGES:
            process.env.GOOGLE_STORAGE_BUCKET_AVATAR_IMAGES,
        REVALIDATE_PATH_TOKEN: process.env.REVALIDATE_PATH_TOKEN,
        TYPESENSE_API_KEY: process.env.TYPESENSE_API_KEY,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
        ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
        MAIL_DRIVER: process.env.MAIL_DRIVER,
        CONTACT_EMAIL: process.env.CONTACT_EMAIL,
        CAPTCHA_SECRET_KEY: process.env.CAPTCHA_SECRET_KEY
    },
    'ENV_CONFIG_PRIVATE',
    process.env.NEXT_PUBLIC_ENV !== 'test' && typeof window === 'undefined'
);

export const isE2ETestMode = (): boolean => {
    return process.env.E2E_TEST_MODE === 'true';
};
