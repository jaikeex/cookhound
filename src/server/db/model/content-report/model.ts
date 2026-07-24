import type {
    ContentReport,
    Prisma
} from '@/server/db/generated/prisma/client';
import { prisma } from '@/server/integrations';
import { Logger } from '@/server/logger';
import { ReportStatus } from '@/common/types/reports/report';
import {
    REPORT_WITH_REPORTER,
    type ContentReportWithReporter
} from '@/server/types/reports';

//|=============================================================================================|//

const log = Logger.getInstance('content-report-model');

//?—————————————————————————————————————————————————————————————————————————————————————————————?//
//?                                     NO CACHING HERE                                         ?//
///
//# Intentionall. Reports are a low-traffic and they must always reflect the latest state,
///
//?—————————————————————————————————————————————————————————————————————————————————————————————?//

const OPEN_STATUS: string[] = [ReportStatus.PENDING, ReportStatus.REVIEWING];

class ContentReportModel {
    //~=========================================================================================~//
    //$                                          QUERIES                                        $//
    //~=========================================================================================~//

    /**
     * Returns the reporter's open report against a given target, if one exists.
     * Query class -> C3
     */
    async getOpenByReporterAndTarget(
        reporterId: number,
        targetType: string,
        targetId: number
    ): Promise<ContentReport | null> {
        log.trace('Getting open report by reporter and target', {
            reporterId,
            targetType,
            targetId
        });

        return prisma.contentReport.findFirst({
            where: {
                reporterId,
                targetType,
                targetId,
                status: { in: OPEN_STATUS }
            }
        });
    }

    /**
     * Returns a single report with its reporter.
     * Query class -> C3
     */
    async getOneById(id: number): Promise<ContentReportWithReporter | null> {
        log.trace('Getting report by id', { id });

        return prisma.contentReport.findUnique({
            where: { id },
            include: REPORT_WITH_REPORTER
        });
    }

    /**
     * Returns a paginated, filterable page of reports, newest first, together with the total matching count.
     * Query class -> C3
     */
    async getMany(options: {
        page: number;
        pageSize: number;
        status?: string;
        targetType?: string;
    }): Promise<{ reports: ContentReportWithReporter[]; total: number }> {
        const { page, pageSize, status, targetType } = options;

        log.trace('Listing reports', { page, pageSize, status, targetType });

        const where: Prisma.ContentReportWhereInput = {
            ...(status ? { status } : {}),
            ...(targetType ? { targetType } : {})
        };

        const [reports, total] = await prisma.$transaction([
            prisma.contentReport.findMany({
                where,
                include: REPORT_WITH_REPORTER,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize
            }),
            prisma.contentReport.count({ where })
        ]);

        return { reports, total };
    }

    /**
     * Counts reports still awaiting a decision (pending or under review).
     * Query class -> C3
     */
    async countOpen(): Promise<number> {
        log.trace('Counting open reports');

        return prisma.contentReport.count({
            where: { status: { in: OPEN_STATUS } }
        });
    }

    //~=========================================================================================~//
    //$                                         MUTATIONS                                       $//
    //~=========================================================================================~//

    /**
     * Persists a new report.
     * Write class -> W3
     */
    async createReport(data: {
        reporterId: number;
        targetType: string;
        targetId: number;
        targetLabel: string;
        targetUrl: string;
        reason: string;
        details: string | null;
    }): Promise<ContentReport> {
        log.trace('Creating report', {
            reporterId: data.reporterId,
            targetType: data.targetType,
            targetId: data.targetId
        });

        return prisma.contentReport.create({ data });
    }

    /**
     * Records a moderation decision on a report.
     * Write class -> W3
     */
    async updateStatus(
        id: number,
        data: {
            status: string;
            reviewedById: number;
            reviewedAt: Date;
            resolution?: string | null;
        }
    ): Promise<ContentReport> {
        log.trace('Updating report status', { id, status: data.status });

        return prisma.contentReport.update({
            where: { id },
            data
        });
    }
}

const contentReportModel = new ContentReportModel();
export default contentReportModel;
