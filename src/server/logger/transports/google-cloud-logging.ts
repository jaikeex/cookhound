import Transport from 'winston-transport';
import type { LogLevel } from '@/server/logger/types';

/**
 * Maps app log levels to Google Cloud Logging severities.
 */
const LEVEL_TO_SEVERITY: Record<LogLevel, string> = {
    trace: 'DEBUG',
    info: 'INFO',
    request: 'INFO',
    notice: 'NOTICE',
    warn: 'WARNING',
    error: 'ERROR'
};

type LogEntry = {
    severity: string;
    timestamp: string;
    labels: { context: string };
    textPayload: string;
};

type WinstonLogInfo = {
    level: string;
    message: string;
    context?: string;
    timestamp?: string;
};

interface GoogleCloudLoggingTransportOptions {
    allowedLevels?: LogLevel[];
}

export class GoogleCloudLoggingTransport extends Transport {
    private readonly maxBatchSize: number;
    private readonly flushIntervalMs: number;
    private readonly allowedLevels: LogLevel[] | undefined;

    private readonly queue: LogEntry[] = [];
    private readonly failedQueue: LogEntry[] = [];
    private flushTimer: NodeJS.Timeout | null = null;
    private retryAttempts = 0;
    private readonly maxRetries = 3;

    //|-----------------------------------------------------------------------------------------|//
    //?                                            SETUP                                        ?//
    //|-----------------------------------------------------------------------------------------|//

    constructor(opts: GoogleCloudLoggingTransportOptions = {}) {
        super(opts as any);

        this.allowedLevels = opts.allowedLevels;

        /**
         * Do not set these to low levels. the gcl is not meant to provide real time info.
         */
        this.maxBatchSize = 50;
        this.flushIntervalMs = 10000;

        // Kick-off periodic flushing
        this.flushTimer = setInterval(
            () => void this.flush(),
            this.flushIntervalMs
        );

        // Do not hold the Node.js event loop open only for the timer.
        this.flushTimer.unref();
    }

    //|-----------------------------------------------------------------------------------------|//
    //?                                       PUBLIC API                                        ?//
    //|-----------------------------------------------------------------------------------------|//

    // This needs to be implemented or winston will scream in space.
    public log(info: WinstonLogInfo, next: () => void): void {
        const level: string = info.level;

        // If a level filter is configured and this level is not included, do nothing.
        if (
            this.allowedLevels &&
            !this.allowedLevels.includes(level as LogLevel)
        ) {
            return next();
        }

        setImmediate(() => this.emit('logged', info));

        this.enqueue(info);

        if (this.queue.length >= this.maxBatchSize) {
            void this.flush();
        }

        next();
    }

    //|-----------------------------------------------------------------------------------------|//
    //?                                         QUEUE                                           ?//
    //|-----------------------------------------------------------------------------------------|//

    private enqueue(info: WinstonLogInfo): void {
        const { message, level, context = 'application' } = info;

        const severity = LEVEL_TO_SEVERITY[level as LogLevel] ?? 'DEFAULT';

        this.queue.push({
            severity,
            timestamp: new Date().toISOString(),
            labels: { context },
            textPayload: message
        });
    }

    private async getGoogleApiService() {
        //?—————————————————————————————————————————————————————————————————————————————————————?//
        //?                                   IMPORTANT INFO                                    ?//
        ///
        //# If the googleApiService was imported statically, it would be locked from ever
        //# using the logger itself because of circular import shenanigans. This ensures that
        //# the initialization of the service can proceed with the logger imported.
        //# The service reference is saved on the first import.
        ///
        //?—————————————————————————————————————————————————————————————————————————————————————?//

        if (this._googleApiService) return this._googleApiService;

        const serviceModule = await import(
            '@/server/services/google-api/service'
        );
        this._googleApiService = serviceModule.googleApiService;
        return this._googleApiService;
    }

    private _googleApiService?: {
        writeLogsToGoogleCloud: (entries: LogEntry[]) => Promise<unknown>;
    };

    private async flush(): Promise<void> {
        if (this.failedQueue.length > 0) {
            await this.attemptFlush(this.failedQueue, true);
        }

        if (this.queue.length > 0) {
            await this.attemptFlush(this.queue, false);
        }
    }

    private async attemptFlush(
        queue: LogEntry[],
        isRetry: boolean
    ): Promise<void> {
        const batchSize = Math.min(queue.length, this.maxBatchSize);
        const entries = queue.splice(0, batchSize);

        try {
            const googleApiService = await this.getGoogleApiService();
            await googleApiService.writeLogsToGoogleCloud(entries);

            if (isRetry) {
                this.retryAttempts = 0;
            }
        } catch (error: unknown) {
            const errorMsg =
                error instanceof Error ? error.message : String(error);

            if (isRetry) {
                this.retryAttempts++;

                if (this.retryAttempts >= this.maxRetries) {
                    // Give up after max retries - emit error and drop logs
                    this.emit(
                        'error',
                        new Error(
                            `[GoogleCloudTransport] Dropped ${entries.length} logs after ${this.maxRetries} retries: ${errorMsg}`
                        )
                    );

                    this.retryAttempts = 0;

                    // Never re-queue failed logs
                    return;
                }
            }

            this.failedQueue.push(...entries);

            this.emit(
                'error',
                new Error(
                    `[GoogleCloudTransport] Failed to flush ${entries.length} logs (attempt ${isRetry ? this.retryAttempts : 1}): ${errorMsg}`
                )
            );
        }
    }

    //|-----------------------------------------------------------------------------------------|//
    //?                                          CLEANUP                                        ?//
    //|-----------------------------------------------------------------------------------------|//

    public close(): void {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
            this.flushTimer = null;
        }

        void this.flush(); // Final flush before closing
    }
}
