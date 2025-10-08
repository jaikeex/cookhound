import type { Prisma } from '@prisma/client';

export type AccountDeletionRequestSelect = Prisma.AccountDeletionRequestSelect;

export const ACCOUNT_DELETION_REQUEST_SELECT: AccountDeletionRequestSelect = {
    id: true,
    userId: true,
    requestedAt: true,
    completedAt: true,
    cancelledAt: true,
    ipAddress: true,
    userAgent: true,
    reason: true,
    proofHash: true,
    userEmail: true,
    userName: true
};

// No sensitive fields here
export const ACCOUNT_DELETION_REQUEST_AUDIT_SELECT: AccountDeletionRequestSelect =
    {
        id: true,
        userId: true,
        requestedAt: true,
        completedAt: true,
        cancelledAt: true,
        reason: true,
        userEmail: true,
        userName: true
    };
