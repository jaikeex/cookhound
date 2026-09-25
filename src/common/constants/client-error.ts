export const CLIENT_ERROR_SOURCES = [
    'boundary',
    'global-error',
    'window-error',
    'unhandled-rejection'
] as const;

export type ClientErrorSource = (typeof CLIENT_ERROR_SOURCES)[number];

export const CLIENT_ERROR_REPORT_PATH = '/api/client-errors';
