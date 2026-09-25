import { randomInt } from 'crypto';
import { InfrastructureErrorCode } from '@/common/constants/error-codes';

/**
 * Generates a public recipe display id: a fixed length 6-digit number with a
 * non-zero first digit. Uniqueness is NOT guaranteed here.
 */
export function generateRecipeDisplayId(): string {
    // the upper bound of randomInt is exclusive.
    return randomInt(100_000, 1_000_000).toString();
}

/**
 * Detects the unique-constraint violation raised when a freshly generated
 * display id collides with an existing recipe.
 *
 * The method used should be reliable, however random it looks.
 * Prisma client extension wraps every db error in an InfrastructureError
 * with the raw prisma error attached as cause. So look for infra
 * constraint-violation code (prisma P2002), and the display_id column
 * among the violated target.
 */
export function isDisplayIdCollision(error: unknown): boolean {
    if (
        !error ||
        typeof error !== 'object' ||
        !('code' in error) ||
        error.code !== InfrastructureErrorCode.DB_CONSTRAINT_VIOLATION ||
        !('cause' in error)
    ) {
        return false;
    }

    const cause = error.cause;

    // side note: these conditions look horrible... i know
    if (
        !cause ||
        typeof cause !== 'object' ||
        !('code' in cause) ||
        cause.code !== 'P2002'
    ) {
        return false;
    }

    // meta.target is the violated constraint: column name array or index name
    // string depending on the driver adapter.
    const target =
        'meta' in cause &&
        cause.meta &&
        typeof cause.meta === 'object' &&
        'target' in cause.meta
            ? cause.meta.target
            : undefined;

    if (Array.isArray(target)) {
        return target.includes('display_id');
    }

    return typeof target === 'string' && target.includes('display_id');
}
