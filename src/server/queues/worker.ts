#!/usr/bin/env node
/*
 * Worker bootstrap file — run this as a separate Node.js process (e.g. using PM2
 * or Docker) to start all queue workers in an isolated instance:
 *
 *   $ node dist/src/server/queues/worker.js
 *
 * All concrete job classes should be imported before initializing the
 * QueueManager so that their definitions are registered.
 */

import 'dotenv/config';
import { queueManager } from './QueueManager';
import { scheduleRecurringJobs } from './cron';
import { recipeSearchIndex } from '@/server/search-index';
import { Logger } from '@/server/logger';

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

    const shutdown = async () => {
        await queueManager.shutdown();
        process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
})();
