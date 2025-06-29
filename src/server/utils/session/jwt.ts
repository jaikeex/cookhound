import jwt from 'jsonwebtoken';
import type { UserRole } from '@/common/types';
import { ENV_CONFIG_PRIVATE } from '@/common/constants';
import { InfrastructureError } from '@/server/error';
import { InfrastructureErrorCode } from '@/server/error/codes';

interface JwtPayload {
    id: string;
    role: UserRole;
}

const JWT_SECRET = ENV_CONFIG_PRIVATE.JWT_SECRET;
const JWT_TOKEN_DURATION_DAYS = ENV_CONFIG_PRIVATE.JWT_TOKEN_DURATION_DAYS;
const JWT_ISSUER = ENV_CONFIG_PRIVATE.JWT_ISSUER;

export const createToken = (payload: JwtPayload): string => {
    if (!JWT_SECRET || !JWT_TOKEN_DURATION_DAYS || !JWT_ISSUER) {
        throw new InfrastructureError(
            InfrastructureErrorCode.JWT_SECRET_NOT_SET
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
        throw new InfrastructureError(
            InfrastructureErrorCode.JWT_SECRET_NOT_SET
        );
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET, {
            issuer: JWT_ISSUER
        }) as JwtPayload;

        return decoded;
    } catch (error: unknown) {
        throw new InfrastructureError(
            InfrastructureErrorCode.JWT_VERIFY_FAILED,
            error
        );
    }
};
