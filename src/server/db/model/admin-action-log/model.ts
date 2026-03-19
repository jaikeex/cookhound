import { prisma } from '@/server/integrations';
import { Logger } from '@/server/logger';
import type { AdminAction } from '@/common/constants';

const log = Logger.getInstance('admin-action-log-model');

type CreateAdminActionLogData = {
    adminUserId: number;
    targetUserId: number;
    action: AdminAction;
    details?: object;
};

class AdminActionLogModel {
    async createOne(data: CreateAdminActionLogData): Promise<void> {
        log.trace('Creating admin action log', {
            action: data.action,
            adminUserId: data.adminUserId,
            targetUserId: data.targetUserId
        });

        await prisma.adminActionLog.create({
            data: {
                adminUserId: data.adminUserId,
                targetUserId: data.targetUserId,
                action: data.action,
                details: data.details ?? {}
            }
        });
    }
}

const adminActionLogModel = new AdminActionLogModel();
export default adminActionLogModel;
