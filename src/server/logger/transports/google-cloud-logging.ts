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

interface GoogleCloudLoggingTransportOptions {
    allowedLevels?: LogLevel[];
}

export class GoogleCloudLoggingTransport extends Transport {
    private readonly maxBatchSize: number;
    private readonly flushIntervalMs: number;
    private readonly allowedLevels: LogLevel[] | undefined;

    private readonly queue: any[] = [];
    private flushTimer: NodeJS.Timeout;

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
    public log(info: any, next: () => void): void {
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

    private enqueue(info: any): void {
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
        writeLogsToGoogleCloud: (entries: any[]) => Promise<unknown>;
    };

    private async flush(): Promise<void> {
        if (this.queue.length === 0) return;

        try {
            const entries = this.queue.splice(0, this.queue.length);

            // Lazily import the Google API service the first time we need it.
            const googleApiService = await this.getGoogleApiService();

            await googleApiService.writeLogsToGoogleCloud(entries);
        } catch (error: unknown) {
            // Failure to write to Cloud Logging should not crash the app.
        }
    }

    //|-----------------------------------------------------------------------------------------|//
    //?                                          CLEANUP                                        ?//
    //|-----------------------------------------------------------------------------------------|//

    public close(): void {
        clearInterval(this.flushTimer);
        void this.flush();
    }
}
