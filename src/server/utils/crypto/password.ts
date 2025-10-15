import argon2 from 'argon2';
import { Logger } from '@/server/logger';
import { randomBytes } from 'crypto';

const log = Logger.getInstance('password-utils');

const MEMORY_COST = 47104;
const TIME_COST = 2;
const PARALLELISM = 4;

// generated with a string that is not possible as a password
export const RANDOM_HASH =
    '$argon2id$v=19$m=47104,t=2,p=4$N3s//I0cws7RW9s4jG6ZCg$ZRwN8AnQiHKX3kdITvqNAuNdWsAPBKVbWDf8Z14qdx0';

export async function hashPassword(password: string): Promise<string> {
    try {
        const hash = await argon2.hash(password, {
            type: argon2.argon2id,
            salt: randomBytes(16),
            memoryCost: MEMORY_COST,
            timeCost: TIME_COST,
            parallelism: PARALLELISM
        });

        return hash;
    } catch (error: unknown) {
        log.error('hashPassword - failed to hash password', { error });
        throw error;
    }
}

export async function verifyPassword(
    password: string,
    hash: string | null | undefined
): Promise<boolean> {
    if (!hash) {
        return false;
    }

    try {
        return await argon2.verify(hash, password);
    } catch (error: unknown) {
        log.error('verifyPassword - failed to verify password', { error });
        return false;
    }
}

/**
 * Check if a password hash needs to be rehashed when the argon settings change.
 * Returns true if any of the checks fail.
 */
export function needsRehash(hash: string | null | undefined): boolean {
    if (!hash) {
        return false;
    }

    try {
        // Parse Argon2 hash format: $argon2id$v=VERSION$m=MEMORY,t=TIME,p=PARALLELISM$salt$hash
        const parts = hash.split('$');

        if (parts.length < 4) {
            return true;
        }

        const params = parts[3];
        const paramMap: Record<string, number> = {};

        if (!params) {
            return true;
        }

        params.split(',').forEach((param) => {
            const [key, value] = param.split('=');

            if (!key || !value) {
                return true;
            }

            paramMap[key] = parseInt(value, 10);
        });

        if (!paramMap['m'] || !paramMap['t'] || !paramMap['p']) {
            return true;
        }

        return (
            paramMap['m'] !== MEMORY_COST ||
            paramMap['t'] !== TIME_COST ||
            paramMap['p'] !== PARALLELISM
        );
    } catch (error: unknown) {
        log.error('needsRehash - failed to parse hash', { error });
        return true;
    }
}

/**
 * Constant-time password verification to prevent timing attacks.
 * I just learned these are a thing btw.
 */
export async function safeVerifyPassword(
    password: string,
    hash: string | null | undefined
): Promise<boolean> {
    try {
        const hashToVerify = hash || RANDOM_HASH;

        const isValid = await argon2.verify(hashToVerify, password);

        return hash ? isValid : false;
    } catch (error: unknown) {
        log.error('safeVerifyPassword - failed to verify password', { error });
        return false;
    }
}
