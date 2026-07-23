import http from 'node:http';
import { queueManager } from '@/server/queues/QueueManager';
import { Logger } from '@/server/logger';

//?—————————————————————————————————————————————————————————————————————————————————————————?//
//?                                    WORKER HEARTBEAT                                     ?//
///
//# The worker process has no HTTP surface of its own, so it cannot be pinged from docker
//# in the same the way as the web container. This module gives it one: a tiny native http
//# server that the compose healthcheck hits on /health.
//#
//# It is important for this to act like a real liveness probe:
//#
//#    - An interval pings the worker's Redis connection and stamps "lastHealthyAt" only
//#      when it answers. A dead Redis link stops advancing the stamp..
//#    - /health returns 200 only while the last successful probe is within STALE_AFTER_MS;
//#      otherwise 503. Once Redis recovers, the next probe starts returning 200 again
//#      (and the docker events watcher emits its "recovered" alert).
//#
//# Also... keep this dependency free if possible...
///
//?—————————————————————————————————————————————————————————————————————————————————————————?//

const log = Logger.getInstance('worker-heartbeat');

const HEALTH_PORT = Number(process.env.WORKER_HEALTH_PORT ?? 3001);
const PROBE_INTERVAL_MS = 15 * 1000;
const STALE_AFTER_MS = 60 * 1000;

let lastHealthyAt = 0;

let probeTimer: NodeJS.Timeout | undefined;
let server: http.Server | undefined;

//|-----------------------------------------------------------------------------------------|//
//?                                          PROBE                                          ?//
//|-----------------------------------------------------------------------------------------|//

async function probe(): Promise<void> {
    const ok = await queueManager.pingRedis();

    if (ok) {
        lastHealthyAt = Date.now();
    }
}

//|-----------------------------------------------------------------------------------------|//
//?                                          START                                          ?//
//|-----------------------------------------------------------------------------------------|//

/**
 * Starts the periodic Redis probe and the /health server.
 */
export function startHeartbeat(): void {
    if (server) {
        log.warn('startHeartbeat - heartbeat already running');
        return;
    }

    // prime the state immediately
    void probe();

    probeTimer = setInterval(() => void probe(), PROBE_INTERVAL_MS);
    probeTimer.unref?.();

    server = http.createServer((request, response) => {
        if (request.url !== '/health') {
            response.writeHead(404).end();
            return;
        }

        const ageMs = Date.now() - lastHealthyAt;
        const healthy = lastHealthyAt > 0 && ageMs < STALE_AFTER_MS;

        response.writeHead(healthy ? 200 : 503, {
            'content-type': 'application/json'
        });

        response.end(
            JSON.stringify({
                status: healthy ? 'ok' : 'stale',
                lastHealthyAt: lastHealthyAt || null,
                ageMs: lastHealthyAt ? ageMs : null
            })
        );
    });

    server.listen(HEALTH_PORT, '127.0.0.1', () => {
        log.info('startHeartbeat - worker health server listening', {
            port: HEALTH_PORT
        });
    });

    server.on('error', (error: unknown) => {
        // ironic
        log.error('startHeartbeat - health server error.', error);
    });
}

//|-----------------------------------------------------------------------------------------|//
//?                                          STOP                                           ?//
//|-----------------------------------------------------------------------------------------|//

export async function stopHeartbeat(): Promise<void> {
    if (probeTimer) {
        clearInterval(probeTimer);
        probeTimer = undefined;
    }

    if (server) {
        await new Promise<void>((resolve) => {
            server?.close(() => resolve());
        });

        server = undefined;
    }
}
