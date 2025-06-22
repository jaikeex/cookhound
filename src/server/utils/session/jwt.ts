import jwt from 'jsonwebtoken';
import type { UserRole } from '@/common/types';
import { ENV_CONFIG_PRIVATE } from '@/common/constants';

interface JwtPayload {
    id: string;
    role: UserRole;
}

const JWT_SECRET = ENV_CONFIG_PRIVATE.JWT_SECRET;
const JWT_TOKEN_DURATION_DAYS = ENV_CONFIG_PRIVATE.JWT_TOKEN_DURATION_DAYS;
const JWT_ISSUER = ENV_CONFIG_PRIVATE.JWT_ISSUER;

export const createToken = (payload: JwtPayload): string => {
    if (!JWT_SECRET || !JWT_TOKEN_DURATION_DAYS || !JWT_ISSUER) {
        throw new Error(
            'JWT variables are not defined in environment variables'
        );
    }

    // @ts-expect-error - expiresIn is not defined in the arguments somehow
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: `${JWT_TOKEN_DURATION_DAYS}d`,
        issuer: JWT_ISSUER
    });
};

export const verifyToken = (token: string): JwtPayload => {
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET, {
            issuer: JWT_ISSUER
        }) as JwtPayload;

        return decoded;
    } catch (error) {
        throw new Error('Invalid token');
    }
};
