import type { Prisma } from '@/server/db/generated/prisma/client';

export const REPORT_WITH_REPORTER = {
    reporter: { select: { username: true } }
} satisfies Prisma.ContentReportInclude;

export type ContentReportWithReporter = Prisma.ContentReportGetPayload<{
    include: typeof REPORT_WITH_REPORTER;
}>;
