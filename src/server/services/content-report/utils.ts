import { InfrastructureErrorCode } from '@/common/constants/error-codes';

const OPEN_REPORT_INDEX = 'content_reports_one_open_per_target';

/**
 * Detects the unique-constraint violation raised when two concurrent report
 * submissions race past the getOpenByReporterAndTarget pre-check and both try
 * to insert an open report for the same (reporter, target).
 */
export function isOpenReportCollision(error: unknown): boolean {
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

    if (
        !cause ||
        typeof cause !== 'object' ||
        !('code' in cause) ||
        cause.code !== 'P2002'
    ) {
        return false;
    }

    const target =
        'meta' in cause &&
        cause.meta &&
        typeof cause.meta === 'object' &&
        'target' in cause.meta
            ? cause.meta.target
            : undefined;

    if (typeof target === 'string') {
        return target.includes(OPEN_REPORT_INDEX);
    }

    if (Array.isArray(target)) {
        return (
            target.includes('reporter_id') &&
            target.includes('target_type') &&
            target.includes('target_id')
        );
    }

    return true;
}
