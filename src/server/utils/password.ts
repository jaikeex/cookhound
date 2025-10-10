import argon2 from 'argon2';
import bcrypt from 'bcrypt';
import { Logger } from '@/server/logger';

const log = Logger.getInstance('password-utils');

//?—————————————————————————————————————————————————————————————————————————————————————————————?//
//?                                       IMPORTANT INFO                                        ?//
///
//# The app originaly used bcrypt, after migration to argon, this seemed like the easiest
//# way to handle existing users. Only rehash on a new login, use argon from that point onwards.
//#
//# Well, the app in production has only 2 users now but this at least looks professional...
///
//?—————————————————————————————————————————————————————————————————————————————————————————————?//

export async function hashPassword(password: string): Promise<string> {
    try {
        const hash = await argon2.hash(password, {
            type: argon2.argon2id
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
        if (isBcryptHash(hash)) {
            return await bcrypt.compare(password, hash);
        } else {
            return await argon2.verify(hash, password);
        }
    } catch (error: unknown) {
        log.error('verifyPassword - failed to verify password', { error });
        return false;
    }
}

export function needsRehash(hash: string): boolean {
    return isBcryptHash(hash);
}

function isBcryptHash(hash: string): boolean {
    return hash.startsWith('$2b$');
}
