import type {
    ReportReason,
    ReportTargetType
} from '@/common/constants/reports';

export enum ReportStatus {
    PENDING = 'pending',
    REVIEWING = 'reviewing',
    ACTIONED = 'actioned',
    DISMISSED = 'dismissed'
}

export type ReportPayload = {
    targetType: ReportTargetType;
    targetId: number;
    reason: ReportReason;
    details?: string;
};

export type ContentReportDTO = {
    id: number;
    reporterId: number;
    reporterUsername: string | null;
    targetType: ReportTargetType;
    targetId: number;
    targetLabel: string;
    targetUrl: string;
    reason: ReportReason;
    details: string | null;
    status: ReportStatus;
    reviewedById: number | null;
    reviewedAt: string | null;
    resolution: string | null;
    createdAt: string;
};

export type ContentReportListDTO = {
    reports: ContentReportDTO[];
    totalItems: number;
    page: number;
    pageSize: number;
};
