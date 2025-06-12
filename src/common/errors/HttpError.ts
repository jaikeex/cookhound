import type { I18nMessage } from '@/client/locales';

export class HttpError extends Error {
    status: number;

    constructor(message: I18nMessage, status: number) {
        super(message);
        this.status = status;
        this.name = 'HttpError';
    }
}
