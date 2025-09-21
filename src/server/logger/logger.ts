import fs from 'fs';
import path from 'path';
import { addColors, createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';
import type { Logger as WinstonLogger, transport } from 'winston';
import { GoogleCloudLoggingTransport } from './transports';
import { ENV_CONFIG_PRIVATE, ENV_CONFIG_PUBLIC } from '@/common/constants';
import { LOG_LEVELS, type LogLevel } from './types';
import { RequestContext } from '@/server/utils/reqwest/context';
import { ServerError } from '@/server/error';
import { ApplicationErrorCode } from '@/server/error/codes';

// Directory where log files will be stored. Can be overridden through the `LOG_DIR` env variable.
const LOG_DIR =
    ENV_CONFIG_PRIVATE.LOG_DIR || path.resolve(process.cwd(), 'logs');

// Ensure that the log directory exists so that the File transport does not throw.
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

//~=============================================================================================~//
//$                                           SETTINGS                                          $//
//~=============================================================================================~//

const myTimestampFormat = format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss,SSS'
});

const myMessageFormat = format.printf((info) => {
    const level = info.level.toUpperCase().padEnd(7, ' ');
    const context = (info.context as string).padEnd(20, ' ');

    return `${info.timestamp} - ${level} - ${context} - ${info.message}`;
});

/**
 * Winston logger instance that all contextual loggers will inherit from.
 */
const baseLogger: WinstonLogger = createLogger({
    level: 'trace',
    levels: LOG_LEVELS.levels,
    format: format.combine(
        // Inject a default context if none was provided
        format((info) => {
            if (!info.context) info.context = 'cookhound-api';
            return info;
        })(),
        myTimestampFormat,
        myMessageFormat
    ),
    transports: [
        new transports.DailyRotateFile({
            filename: path.join(LOG_DIR, 'cookhound-api-%DATE%.log'),
            maxSize: 20 * 1024 * 1024,
            maxFiles: '14d',
            datePattern: 'YYYY-MM-DD'
        })
    ],
    exitOnError: false
});

// Add the Google Cloud Logging transport ONLY in production.
if (ENV_CONFIG_PUBLIC.ENV === 'production') {
    baseLogger.add(
        new GoogleCloudLoggingTransport({
            allowedLevels: ['error', 'notice']
        })
    );
}

//~=============================================================================================~//
//$                                           CONSOLE                                           $//
//~=============================================================================================~//

// In development, also output to console so debugging does not take years.
if (ENV_CONFIG_PUBLIC.ENV === 'production') {
    baseLogger.add(
        new transports.Console({
            format: format.combine(
                myTimestampFormat,
                myMessageFormat,
                format.colorize({ all: true })
            )
        })
    );

    // Add colorization to the console transport.
    addColors(LOG_LEVELS.colors);
}

//~=============================================================================================~//
//$                                            LOGGER                                           $//
//~=============================================================================================~//

export class Logger {
    private static instances: Map<string, Logger> = new Map();

    private readonly logger: WinstonLogger;

    private constructor(private readonly context: string) {
        this.logger = baseLogger.child({ context });

        //?—————————————————————————————————————————————————————————————————————————————————————?//
        //?                                GLOBAL PROCESS GUARDS                                ?//
        ///
        //# These listeners serve as an insurance that no uncaught error inside the app process
        //# (or any other process that imports this module, which includes the worker process)
        //# is ever silently ignored.
        //#
        //# The placement here is odd, the intention is to have them in a place that will get
        //# executed early every time the app runs. I initially tried to place them at the top
        //# level in this file but that does not work since the logger did not yet initalize,
        //# so this is the second best place that i found.
        ///
        //?—————————————————————————————————————————————————————————————————————————————————————?//

        (function registerProcessGuards() {
            /**
             * Skip on invocation that does not run in node.js process (e.g. middleware edge).
             */
            if (typeof process === 'undefined' || !process.on) return;

            /**
             * Save the guard symbol so that the listeners are not registered twice or more.
             */
            const GUARD = Symbol.for('cookhound.process-guards');
            if ((globalThis as any)[GUARD]) return;
            (globalThis as any)[GUARD] = true;

            const log = Logger.getInstance('process');

            // Throwing here makes no sense, but logging is essential
            process.on('uncaughtException', (err) => {
                log.errorWithStack('uncaughtException', err);
            });

            process.on('unhandledRejection', (reason) => {
                log.errorWithStack('unhandledRejection', reason);
            });
        })();
    }

    //|-----------------------------------------------------------------------------------------|//
    //?                                        INSTANCE GETTER                                  ?//
    //|-----------------------------------------------------------------------------------------|//

    /**
     * Get (or create) a logger for the given context. Ensures that we only ever
     * create one logger per context, preventing duplicated log lines and wasting
     * resources.
     */
    public static getInstance(context: string): Logger {
        let instance;

        if (this.instances.has(context)) {
            instance = this.instances.get(context);
        } else {
            try {
                instance = new Logger(context);
                this.instances.set(context, instance);
            } catch (error: unknown) {
                /**
                 * Do nothing here. Failure to log an entry should never result in the app crashing
                 * or in any feedback to the user.
                 */
            }
        }

        if (!instance) {
            /**
             * It is ok to throw here, since all instances should be crated at app startup.
             */
            throw new Error('Logger context is missing');
        }
        return instance;
    }

    //|-----------------------------------------------------------------------------------------|//
    //?                                       PUBLIC API                                        ?//
    //|-----------------------------------------------------------------------------------------|//

    public trace(message: unknown, ...additional: unknown[]): void {
        this.log('trace', message, additional);
    }

    public info(message: unknown, ...additional: unknown[]): void {
        this.log('info', message, additional);
    }

    public notice(message: unknown, ...additional: unknown[]): void {
        this.log('notice', message, additional);
    }

    public request(message: unknown, ...additional: unknown[]): void {
        this.log('request', message, additional);
    }

    public warn(message: unknown, ...additional: unknown[]): void {
        this.log('warn', message, additional);
    }

    public error(
        message: unknown,
        error?: unknown,
        ...additional: unknown[]
    ): void {
        const errorInformation = {
            message:
                error && error instanceof Error ? error.message : 'unknown',
            code:
                error && error instanceof ServerError
                    ? error.code
                    : ApplicationErrorCode.DEFAULT
        };

        this.log('error', message, [
            ...(error ? [errorInformation] : []),
            ...additional
        ]);
    }

    public errorWithStack(
        message: unknown,
        error: unknown,
        ...additional: unknown[]
    ): void {
        const errorInformation = this.serialiseError(error);
        this.log('error', message, [errorInformation, ...additional]);
    }

    //|-----------------------------------------------------------------------------------------|//
    //?                                        EXTENSIBILITY                                    ?//
    //|-----------------------------------------------------------------------------------------|//

    public static addTransport(transportInstance: transport): void {
        baseLogger.add(transportInstance);
    }

    public static removeTransport(transportInstance: transport): void {
        baseLogger.remove(transportInstance);
    }

    //|-----------------------------------------------------------------------------------------|//
    //?                                     PRIVATE METHODS                                     ?//
    //|-----------------------------------------------------------------------------------------|//

    //?—————————————————————————————————————————————————————————————————————————————————————————?//
    //?                                       FORMATTING                                        ?//
    ///
    //# The serialize and safeStringify methods are required now to create readable logs.
    //# The long-term plan here is to log in json format and then parse the logs someplace else
    //# (Preferably in cookhound administration), but that is a long way of, so this is
    //# the solution for now.
    ///
    //?—————————————————————————————————————————————————————————————————————————————————————————?//

    private log(
        level: LogLevel,
        message: unknown,
        additional: unknown[]
    ): void {
        try {
            // Winston requires the primary log message to be a string.
            let finalMessage = '';

            finalMessage = this.serialise(message, additional);

            const requestId = RequestContext.getRequestId();
            const userId = RequestContext.getUserId();

            const requestIdMessagePart = requestId ? `[${requestId}]` : '[]';
            const userIdMessagePart = userId
                ? `[user id: ${userId}]`
                : '[anonymous]';

            finalMessage = `${requestIdMessagePart} ${userIdMessagePart.padEnd(14, ' ')} ${finalMessage}`;

            this.logger.log(level, finalMessage);
        } catch {
            /**
             * Do nothing here. Failure to log an entry should never result in the app crashing
             * or in any feedback to the user.
             */
        }
    }

    private serialise(message: unknown, additional: unknown[]): string {
        const main =
            typeof message === 'string' ? message : this.safeStringify(message);
        if (!additional.length) {
            return main;
        }

        const extras = additional.map((arg) =>
            typeof arg === 'string' ? arg : this.safeStringify(arg)
        );
        return `${main} | ${extras.join(' | ')}`;
    }

    private serialiseError(error: unknown): string {
        if (!(error instanceof Error)) {
            return String(error);
        }

        const stack = error.stack ?? error.message;

        const code =
            error instanceof ServerError
                ? error.code
                : ApplicationErrorCode.DEFAULT;

        const causePart = error.cause
            ? `\nCaused by: ${this.serialiseError(error.cause)}`
            : '';

        return `${code} | ${stack}${causePart}`;
    }

    /**
     * Attempt to stringify a value while guarding against circular structures.
     * Falls back to `toString()` if `JSON.stringify` fails.
     */
    private safeStringify(value: unknown): string {
        /**
         * Preserve plain strings as is so that existing characters render correctly in both the
         * console and file outputs. Calling `util.inspect` or `JSON.stringify` on a string would escape everything,
         * causing the readability of log to go negative. By short-circuiting here multiline messages are kept intact.
         */

        if (typeof value === 'string') {
            return value;
        }

        try {
            /**
             * This is a useful tool for debugging, as it makes the log print any appended object
             * as a beautified json. Leaving it for reference here.
             */
            // const isDev = ENV_CONFIG_PUBLIC.ENV !== 'production';

            // if (isDev) {
            //     return util.inspect(value, {
            //         depth: null,
            //         compact: false,
            //         breakLength: 120
            //     });
            // }

            return JSON.stringify(value);
        } catch {
            try {
                // Fall back to toString implementations.
                return String(value);
            } catch {
                return '[Unserialisable value]';
            }
        }
    }
}
