/* eslint-disable no-console */

import fs from 'fs';
import path from 'path';
import { addColors, createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';
import type { Logger as WinstonLogger, transport } from 'winston';
import { GoogleCloudLoggingTransport } from './transports';
import { ENV_CONFIG_PRIVATE, ENV_CONFIG_PUBLIC } from '@/common/constants';
import { LOG_LEVELS, type LogLevel } from './types';
import { RequestContext } from '@/server/utils/reqwest/context';

//Directory where log files will be stored. Can be overridden through the `LOG_DIR` env variable.
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
        }),
        new GoogleCloudLoggingTransport({
            allowedLevels: ['error', 'notice']
        })
    ],
    exitOnError: false
});

//~=============================================================================================~//
//$                                           CONSOLE                                           $//
//~=============================================================================================~//

// In development, also output to console so debugging does not take years.
if (ENV_CONFIG_PUBLIC.ENV !== 'production') {
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
            } catch (error) {
                /**
                 * Do nothing here. Failure to log an entry should never result in the app crashing
                 * or in any feedback to the user.
                 */
            }
        }

        if (!instance) {
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

    public error(message: unknown, ...additional: unknown[]): void {
        this.log('error', message, additional);
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

    /**
     * Attempt to stringify a value while guarding against circular structures.
     * Falls back to `toString()` if `JSON.stringify` fails.
     */
    private safeStringify(value: unknown): string {
        try {
            return JSON.stringify(value);
        } catch {
            try {
                // Some objects may implement their own `toString` method.
                return String(value);
            } catch {
                return '[Unserialisable value]';
            }
        }
    }
}
