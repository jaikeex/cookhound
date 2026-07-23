#!/usr/bin/env node

import http from 'node:http';

//?—————————————————————————————————————————————————————————————————————————————————————————?//
//?                                  DOCKER EVENTS WATCHER                                  ?//
///
//# Streams the Docker events API from the host socket and pushes container lifecycle
//# alerts to a ntfy topic. This has intentionally ZERO runtime deps and uses native
//# (is that the right word?) node utilities only. Keep this barebones at all times.
//#
//# The event policy itself is as follows:
//#
//#    - health_status: unhealthy  -> max-priority alert, once per failure
//#    - health_status: healthy    -> "recovered" alert if previously unhealthy
//#    - oom                       -> remembered; annotates the following die
//#    - die                       -> exit codes 0 (clean) and 143 (SIGTERM,
//#                                   normal compose recreate) are IGNORED so
//#                                   deploys stay silent. Anything else alerts
//#                                   immediately.
///
//?—————————————————————————————————————————————————————————————————————————————————————————?//

//|-----------------------------------------------------------------------------------------|//
//?                                       ENVIRONMENT                                       ?//
//|-----------------------------------------------------------------------------------------|//

const SOCK = process.env.DOCKER_SOCK || '/var/run/docker.sock';
const NTFY_URL = process.env.NTFY_URL || 'https://ntfy.sh';
const NTFY_TOPIC = process.env.NTFY_TOPIC || '';
const PROJECT = process.env.WATCH_PROJECT || 'cookhound';

const DIE_DEBOUNCE_WINDOW_MS = 10 * 60 * 1000;
const OOM_CORRELATION_WINDOW_MS = 60 * 1000;
const RECONNECT_MAX_DELAY_MS = 60 * 1000;
const NTFY_TIMEOUT_MS = 5000;

/** Exit codes produced by a normal `docker compose up` recreate. */
const IGNORED_EXIT_CODES = new Set(['0', '143']);

//|-----------------------------------------------------------------------------------------|//
//?                                          SETUP                                          ?//
//|-----------------------------------------------------------------------------------------|//

/** Container names currently in an alerted-unhealthy episode. */
const unhealthy = new Set();

/** Container name -> timestamp of its last oom event. */
const oomAt = new Map();

/** Container name -> { lastAlertAt, suppressed, timer } die-debounce state. */
const dieState = new Map();

/** Unix seconds of the last processed event. Feeds the reconnect `since` param. */
let lastEventTs = 0;

/**
 * timeNano of the last processed event, used to drop replayed duplicates.
 *
 * The reconnect since param only has second granularity, so Docker re-delivers
 * every event from that whole second. Without this guard a single already alerted
 * die would re-enter the debounce and fire a false restart loop summary.
 */
let lastEventNano = 0;

//|-----------------------------------------------------------------------------------------|//
//?                                         NOTIFY                                          ?//
//|-----------------------------------------------------------------------------------------|//

async function notify(title, message, priority, tags) {
    try {
        const response = await fetch(`${NTFY_URL}/${NTFY_TOPIC}`, {
            method: 'POST',
            body: message,
            headers: {
                Title: title,
                Priority: String(priority),
                Tags: tags
            },
            signal: AbortSignal.timeout(NTFY_TIMEOUT_MS)
        });

        if (!response.ok) {
            console.error(
                `[watcher] ntfy rejected message: ${response.status}`
            );
        }
    } catch (error) {
        console.error(`[watcher] ntfy post failed: ${error.message}`);
    }
}

//|-----------------------------------------------------------------------------------------|//
//?                                      HANDLE EVENT                                       ?//
//|-----------------------------------------------------------------------------------------|//

function handleEvent(event) {
    if (event.timeNano) {
        if (event.timeNano <= lastEventNano) {
            return;
        }

        lastEventNano = event.timeNano;
        lastEventTs = Math.floor(event.timeNano / 1e9);
    }

    const name =
        event.Actor?.Attributes?.name ?? (event.id ?? 'unknown').slice(0, 12);

    const action = event.Action ?? '';

    if (action === 'oom') {
        oomAt.set(name, Date.now());
        return;
    }

    if (action === 'health_status: unhealthy') {
        if (!unhealthy.has(name)) {
            unhealthy.add(name);
            void notify(
                'Container unhealthy',
                `${name} failed its healthcheck`,
                5,
                'rotating_light'
            );
        }

        return;
    }

    if (action === 'health_status: healthy') {
        if (unhealthy.delete(name)) {
            void notify(
                'Container recovered',
                `${name} is healthy again`,
                3,
                'white_check_mark'
            );
        }

        return;
    }

    if (action === 'die') {
        const exitCode = event.Actor?.Attributes?.exitCode ?? '?';

        if (IGNORED_EXIT_CODES.has(exitCode)) {
            return;
        }

        onDie(name, exitCode);
    }
}

//|-----------------------------------------------------------------------------------------|//
//?                                         ON DIE                                          ?//
//|-----------------------------------------------------------------------------------------|//

function onDie(name, exitCode) {
    const now = Date.now();
    const wasOom = now - (oomAt.get(name) ?? 0) < OOM_CORRELATION_WINDOW_MS;

    const state = dieState.get(name) ?? {
        lastAlertAt: 0,
        suppressed: 0,
        timer: null
    };

    // First death in the window: alert immediately.
    if (now - state.lastAlertAt > DIE_DEBOUNCE_WINDOW_MS) {
        void notify(
            'Container died',
            `${name} exited with code ${exitCode}${wasOom ? ' (OOM killed)' : ''}`,
            5,
            'skull'
        );

        dieState.set(name, { lastAlertAt: now, suppressed: 0, timer: null });

        return;
    }

    // Restart loop: swallow repeats, arm one summary for the window's end.
    state.suppressed += 1;

    if (!state.timer) {
        state.timer = setTimeout(
            () => {
                void notify(
                    'Container died',
                    `${name} died ${state.suppressed} more time(s) in the last 10 min (restart loop?)`,
                    3,
                    'skull'
                );
                dieState.delete(name);
            },
            state.lastAlertAt + DIE_DEBOUNCE_WINDOW_MS - now
        );

        state.timer.unref?.();
    }

    dieState.set(name, state);
}

//|-----------------------------------------------------------------------------------------|//
//?                                         CONNECT                                         ?//
//|-----------------------------------------------------------------------------------------|//

function connect(attempt = 0) {
    const filters = JSON.stringify({
        type: ['container'],
        label: [`com.docker.compose.project=${PROJECT}`]
    });

    const since = lastEventTs ? `&since=${lastEventTs}` : '';
    const path = `/events?filters=${encodeURIComponent(filters)}${since}`;

    let retried = false;

    const retry = () => {
        if (retried) {
            return;
        }

        retried = true;

        const delay = Math.min(RECONNECT_MAX_DELAY_MS, 1000 * 2 ** attempt);

        console.error(
            `[watcher] event stream lost, reconnecting in ${delay}ms`
        );

        setTimeout(() => connect(attempt + 1), delay);
    };

    const request = http.request({ socketPath: SOCK, path }, (response) => {
        // A non-200 here (unsupported API version, bad filter, socket permission
        // issue) still delivers a body. Drain it WITHOUT resetting the backoff,
        // otherwise the error payload would count as "stream is alive" and pin
        // the reconnect loop at its minimum delay forever.
        if (response.statusCode !== 200) {
            console.error(
                `[watcher] docker events API returned HTTP ${response.statusCode}, retrying`
            );

            response.resume();
            response.on('end', retry);
            response.on('error', retry);

            return;
        }

        console.error(
            `[watcher] connected to docker events (project=${PROJECT})`
        );

        let buffer = '';
        response.setEncoding('utf8');

        response.on('data', (chunk) => {
            buffer += chunk;

            let newline;

            while ((newline = buffer.indexOf('\n')) !== -1) {
                const line = buffer.slice(0, newline).trim();
                buffer = buffer.slice(newline + 1);

                if (!line) {
                    continue;
                }

                try {
                    handleEvent(JSON.parse(line));
                    attempt = 0; // a parsed event proves the stream is healthy
                } catch {
                    // Partial or garbage line - skip it.
                }
            }
        });

        response.on('end', retry);
        response.on('error', retry);
    });

    request.on('error', (error) => {
        console.error(`[watcher] socket error: ${error.message}`);
        retry();
    });

    request.end();
}

//|-----------------------------------------------------------------------------------------|//
//?                                  LISTENERS AND STARTUP                                  ?//
//|-----------------------------------------------------------------------------------------|//

process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));

if (!NTFY_TOPIC) {
    // NEVER exit here. Idle instead.
    setInterval(() => {}, 2 ** 30);
} else {
    void notify(
        'Docker events watcher online',
        `watching project ${PROJECT}`,
        2,
        'eyes'
    );

    connect();
}
