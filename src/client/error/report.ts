import {
    CLIENT_ERROR_REPORT_PATH,
    type ClientErrorSource
} from '@/common/constants/client-error';

const MAX_REPORTS_PER_PAGE = 10;
const reported = new Set<string>();

/**
 * Best-effort, fire-and-forget report of an unexpected client error to the server log.
 * Never throws. Deduplicated and capped per page load.
 */
export function reportClientError(
    error: unknown,
    source: ClientErrorSource
): void {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        const err = error instanceof Error ? error : new Error(String(error));

        // Transport failures are expected and already logged server-side.
        if (err.name === 'RequestError') {
            return;
        }

        const fingerprint = `${err.name}:${err.message}`;

        if (
            reported.has(fingerprint) ||
            reported.size >= MAX_REPORTS_PER_PAGE
        ) {
            return;
        }

        reported.add(fingerprint);

        const body = JSON.stringify({
            source,
            name: err.name.slice(0, 200),
            message: err.message.slice(0, 1000),
            stack: err.stack?.slice(0, 8000),
            path: window.location.pathname.slice(0, 2000)
        });

        // Some browsers throw instead of returning false (e.g. on a
        // non-safelisted Blob type), so a throw must fall through to fetch.
        let queued = false;

        try {
            queued =
                navigator.sendBeacon?.(
                    CLIENT_ERROR_REPORT_PATH,
                    new Blob([body], { type: 'application/json' })
                ) ?? false;
        } catch {
            // Handled by the fetch below.
        }

        if (!queued) {
            void fetch(CLIENT_ERROR_REPORT_PATH, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body,
                keepalive: true
            }).catch(() => undefined);
        }
    } catch {
        // Reporting itself must never throw.
    }
}
