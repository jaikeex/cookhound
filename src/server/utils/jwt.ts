import jwt from 'jsonwebtoken';
import type { UserRole } from '@/common/types';

interface JwtPayload {
    id: string;
    role: UserRole;
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

export const createToken = (payload: JwtPayload): string => {
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }

    // @ts-expect-error - expiresIn is not defined in the arguments somehow
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN ?? '1d'
    });
};

export const verifyToken = (token: string): JwtPayload => {
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }
    try {
        return jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch (error) {
        throw new Error('Invalid token');
    }
};
