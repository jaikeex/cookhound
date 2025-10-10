import argon2 from 'argon2';
import { Logger } from '@/server/logger';
import { randomBytes } from 'crypto';

const log = Logger.getInstance('password-utils');

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
    hash: string
): Promise<boolean> {
    try {
        return await argon2.verify(hash, password);
    } catch (error: unknown) {
        log.error('verifyPassword - failed to verify password', { error });
        return false;
    }
}
