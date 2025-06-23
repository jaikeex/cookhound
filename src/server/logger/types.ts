/**
 * Supported log levels in this project.
 */
export type LogLevel =
    | 'trace'
    | 'info'
    | 'request'
    | 'notice'
    | 'warn'
    | 'error';

export const LOG_LEVELS = {
    levels: {
        error: 0,
        warn: 1,
        notice: 2,
        request: 3,
        info: 4,
        trace: 5
    },
    colors: {
        error: 'red',
        warn: 'yellow',
        notice: 'blue',
        request: 'cyan',
        info: 'green',
        trace: 'gray'
    }
};
