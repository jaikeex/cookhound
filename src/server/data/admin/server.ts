import 'server-only';
import { cache } from 'react';
import { adminReads } from '@/server/services';
import type { AdminDashboardStatsDTO } from '@/common/types';
import { ensureRenderContext } from '@/server/data/runtime/ensureContext';

/**
 * Server-side data access for the admin domain.
 *
 * Methods stay raw: they rethrow the service's errors and leave render call
 * sites to handle them.

 */
export const adminServerData = {
    getDashboardStats: cache((): Promise<AdminDashboardStatsDTO> =>
        ensureRenderContext(() => adminReads.getDashboardStats())
    )
};
