import argon2 from 'argon2';
import { Logger } from '@/server/logger';
import { randomBytes } from 'crypto';

const log = Logger.getInstance('password-utils');

// generated with a string that is not possible as a password
export const RANDOM_HASH =
    '$argon2id$v=19$m=19456,t=2,p=4$N3s//I0cws7RW9s4jG6ZCg$ZRwN8AnQiHKX3kdITvqNAuNdWsAPBKVbWDf8Z14qdx0';

export async function hashPassword(password: string): Promise<string> {
    try {
        const hash = await argon2.hash(password, {
            type: argon2.argon2id,
            salt: randomBytes(16),
            memoryCost: 19456,
            timeCost: 2,
            parallelism: 4
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
