/**
 * Supported log levels in this project.
 */
export type LogLevel = 'trace' | 'info' | 'notice' | 'warn' | 'error';

export const LOG_LEVELS = {
    levels: {
        error: 0,
        warn: 1,
        notice: 2,
        info: 3,
        trace: 4
    },
    colors: {
        error: 'red',
        warn: 'yellow',
        notice: 'cyan',
        info: 'green',
        trace: 'gray'
    }
};
