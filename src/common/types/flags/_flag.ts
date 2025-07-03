import type { FlagReason } from '@/common/constants';

export type Flag = {
    id: number;
    reason: FlagReason;
    userId: number;
    resolved: boolean;
    active: boolean;
    createdAt: Date;
    resolvedAt: Date | null;
};
