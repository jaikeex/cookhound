import type { I18nMessage } from '@/client/locales';
import { ReportReason, ReportTargetType } from '@/common/constants';
import { ReportStatus } from '@/common/types';

export const REPORT_REASON_LABEL_KEY: Record<ReportReason, I18nMessage> = {
    [ReportReason.ILLEGAL_CONTENT]: 'report.reason.illegal_content',
    [ReportReason.HATE_SPEECH]: 'report.reason.hate_speech',
    [ReportReason.HARASSMENT]: 'report.reason.harassment',
    [ReportReason.SEXUAL_CONTENT]: 'report.reason.sexual_content',
    [ReportReason.DANGEROUS]: 'report.reason.dangerous',
    [ReportReason.IP_INFRINGEMENT]: 'report.reason.ip_infringement',
    [ReportReason.PERSONAL_DATA]: 'report.reason.personal_data',
    [ReportReason.SPAM]: 'report.reason.spam',
    [ReportReason.OTHER]: 'report.reason.other'
};

// Display order of the reasons (most severe first)
export const REPORT_REASON_ORDER: readonly ReportReason[] = [
    ReportReason.ILLEGAL_CONTENT,
    ReportReason.HATE_SPEECH,
    ReportReason.HARASSMENT,
    ReportReason.SEXUAL_CONTENT,
    ReportReason.DANGEROUS,
    ReportReason.IP_INFRINGEMENT,
    ReportReason.PERSONAL_DATA,
    ReportReason.SPAM,
    ReportReason.OTHER
];

export const REPORT_STATUS_LABEL_KEY: Record<ReportStatus, I18nMessage> = {
    [ReportStatus.PENDING]: 'report.status.pending',
    [ReportStatus.REVIEWING]: 'report.status.reviewing',
    [ReportStatus.ACTIONED]: 'report.status.actioned',
    [ReportStatus.DISMISSED]: 'report.status.dismissed'
};

export const REPORT_STATUS_CHIP_COLOR: Record<
    ReportStatus,
    'primary' | 'secondary' | 'danger' | 'subtle' | 'warning'
> = {
    [ReportStatus.PENDING]: 'warning',
    [ReportStatus.REVIEWING]: 'secondary',
    [ReportStatus.ACTIONED]: 'primary',
    [ReportStatus.DISMISSED]: 'subtle'
};

export const REPORT_TARGET_TYPE_LABEL_KEY: Record<
    ReportTargetType,
    I18nMessage
> = {
    [ReportTargetType.RECIPE]: 'report.target.recipe',
    [ReportTargetType.COOKBOOK]: 'report.target.cookbook',
    [ReportTargetType.USER]: 'report.target.user'
};
