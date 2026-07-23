#!/usr/bin/env node

import 'dotenv/config';
import { queueManager } from '@/server/queues/QueueManager';
import { scheduleRecurringJobs } from './cron';
import { startHeartbeat, stopHeartbeat } from './heartbeat';
import { recipeSearchIndex } from '@/server/search-index';
import { Logger } from '@/server/logger';

/**
 * Worker bootstrap file. Run this as a separate Node.js process to start all queue workers
 * in an isolated instance.
 *
 *! All concrete job classes should be imported before initializing the
 *! QueueManager so that their definitions are registered.
 */

const log = Logger.getInstance('worker-bootstrap');

(async () => {
    await queueManager.initialize(true);

    //?—————————————————————————————————————————————————————————————————————————————————————————?//
    //?                                     TYPESENSE SYNC                                      ?//
    ///
    //# Sync the typesense recipe collection schema eagerly so that any drift introduced by
    //# this deploy (e.g., a newly declared field, which breaks the search immediately i just found)
    //# is surfaced here instead of as a silent db-search fallback on the next user query.
    //#
    //# Typesense outages here must not block the worker from starting however. The search index
    //# has its own lazy paths to trigger the sync, so logging the failure here should be enough.
    ///
    //?—————————————————————————————————————————————————————————————————————————————————————————?//

    try {
        await recipeSearchIndex.ensureCollectionReady();
    } catch (error: unknown) {
        log.errorWithStack(
            'worker - Typesense schema reconciliation failed at boot',
            error
        );
    }

    await scheduleRecurringJobs();

    // Start last, once queues are live, so the /health server only reports ready after the
    // worker can actually process jobs.
    startHeartbeat();

    const shutdown = async () => {
        await stopHeartbeat();
        await queueManager.shutdown();
        process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
})();
