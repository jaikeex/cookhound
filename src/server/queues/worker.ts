#!/usr/bin/env node
/*
 * Worker bootstrap file — run this as a separate Node.js process (e.g. using PM2
 * or Docker) to start all queue workers in an isolated instance:
 *
 *   $ node dist/src/server/queues/worker.js
 *
 * All concrete job classes should be imported **before** initializing the
 * QueueManager so that their definitions are registered.
 */

import 'dotenv/config';
import { queueManager } from './QueueManager';
import { scheduleRecurringJobs } from './cron';

// Import job implementations ----------------------------------------------------
// eslint-disable-next-line import/no-unassigned-import

(async () => {
    await queueManager.initialize(true);

    // Schedule recurring cron jobs (e.g. Typesense re-index)
    await scheduleRecurringJobs();

    // Graceful shutdown ---------------------------------------------------------
    const shutdown = async () => {
        await queueManager.shutdown();
        process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
})();
