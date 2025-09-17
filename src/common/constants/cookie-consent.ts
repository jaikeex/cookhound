import { ONE_YEAR_IN_SECONDS } from './time';
import { ENV_CONFIG_PRIVATE } from './env';

export const COOKIE_NAME = 'cookie_consent';

export const CONSENT_COOKIE_MAX_AGE = ONE_YEAR_IN_SECONDS;

export const CONSENT_VERSION = '2025-09-15';

export const CONSENT_HASHES = {
    '2025-09-15': ENV_CONFIG_PRIVATE.COOKIE_CONSENT_HASH_V2025_09_15
} as const;
